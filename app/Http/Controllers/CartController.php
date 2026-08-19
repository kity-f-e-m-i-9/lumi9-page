<?php

namespace App\Http\Controllers;

use App\Models\AbandonedCart;
use App\Models\Product;
use App\Models\ProductVarient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CartController extends Controller
{
    /**
     * Category ID for the Lumi9 diaper catalog.
     */
    protected const DIAPER_CATEGORY_ID = 4;

    /**
     * List active Lumi9 diaper products with their variants.
     */
    public function products()
    {
        $products = Product::with(['variants' => function ($query) {
            $query->where('status', 1)->orderBy('price');
        }])
            ->where('category_id', self::DIAPER_CATEGORY_ID)
            ->orderBy('id')
            ->get();

        return response()->json([
            'success' => true,
            'products' => $products,
        ]);
    }

    /**
     * Add, remove, or set the quantity of a variant in the cart cookie.
     * type: 1 = increment by addval, 2 = remove, 3 = set exact quantity.
     */
    public function add(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'id' => 'required|exists:product_varient,id',
                'type' => 'required|in:1,2,3',
                'addval' => 'required|integer',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $variant = ProductVarient::find($request->id);

            $cart = $this->readCart($request);

            if ($request->type == 1) {
                $currentQty = $cart[$request->id] ?? 0;
                $newQty = $currentQty + $request->addval;

                if ($newQty > $variant->quantity) {
                    return response()->json([
                        'success' => false,
                        'message' => $variant->quantity > 0
                            ? 'Only '.$variant->quantity.' items available in stock'
                            : 'Product is out of stock',
                    ], 400);
                }

                $cart[$request->id] = $newQty;
            } elseif ($request->type == 2) {
                unset($cart[$request->id]);
            } elseif ($request->type == 3) {
                if ($request->addval > $variant->quantity) {
                    return response()->json([
                        'success' => false,
                        'message' => $variant->quantity > 0
                            ? 'Only '.$variant->quantity.' items available in stock'
                            : 'Product is out of stock',
                    ], 400);
                }

                if ($request->addval <= 0) {
                    unset($cart[$request->id]);
                } else {
                    $cart[$request->id] = $request->addval;
                }
            }

            $this->trackCartForAbandonment($cart, $request);

            $response = response()->json([
                'success' => true,
                'message' => 'Cart updated successfully',
                'cart' => $cart,
            ]);

            return $this->withCartCookies($response, $cart, $request);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error in CartController@add: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating your cart.',
            ], 500);
        }
    }

    /**
     * Return cart items joined with current product/variant data, plus totals.
     */
    public function list(Request $request)
    {
        $cart = $this->readCart($request);

        if (empty($cart)) {
            return response()->json([
                'success' => true,
                'items' => [],
                'subtotal' => 0,
                'itemCount' => 0,
            ]);
        }

        $variantIds = array_keys($cart);

        $variants = ProductVarient::with('product')
            ->whereIn('id', $variantIds)
            ->where('status', 1)
            ->get();

        $items = $variants->map(function (ProductVarient $variant) use ($cart) {
            $qty = $cart[$variant->id] ?? 0;
            $price = $variant->price - $variant->discount;

            return [
                'variantId' => $variant->id,
                'productId' => $variant->product_id,
                'name' => $variant->product->name ?? 'Unknown Product',
                'label' => $variant->label,
                'image' => $variant->product->image ?? null,
                'price' => (float) $price,
                'mrp' => (float) $variant->price,
                'qty' => $qty,
                'stock' => $variant->quantity,
            ];
        })->values();

        $subtotal = $items->sum(fn ($item) => $item['price'] * $item['qty']);
        $itemCount = $items->sum('qty');

        return response()->json([
            'success' => true,
            'items' => $items,
            'subtotal' => $subtotal,
            'itemCount' => $itemCount,
        ]);
    }

    /**
     * Return only the total item count in the cart.
     */
    public function count(Request $request)
    {
        $cart = $this->readCart($request);
        $total = array_sum($cart);

        return response()->json([
            'success' => true,
            'count' => $total,
        ]);
    }

    /**
     * Empty the cart cookie.
     */
    public function clear(Request $request)
    {
        $response = response()->json([
            'success' => true,
            'message' => 'Cart cleared.',
        ]);

        return $response->withCookie(cookie()->forever('addtocart', json_encode([])));
    }

    /**
     * Decode the addtocart cookie into a [variantId => qty] array.
     */
    protected function readCart(Request $request): array
    {
        $raw = $request->cookie('addtocart');

        if (empty($raw)) {
            return [];
        }

        $decoded = json_decode($raw, true);

        return is_array($decoded) ? $decoded : [];
    }

    /**
     * Attach the updated cart cookie (and a visitor_id cookie if missing) to a response.
     */
    protected function withCartCookies($response, array $cart, Request $request)
    {
        $response = $response->withCookie(cookie()->forever('addtocart', json_encode($cart)));

        if (! $request->cookie('visitor_id')) {
            $response = $response->withCookie(cookie('visitor_id', (string) Str::uuid(), 60 * 24 * 365));
        }

        return $response;
    }

    /**
     * Upsert an AbandonedCart row for this visitor/user so cart-recovery
     * reminders can be sent later.
     */
    protected function trackCartForAbandonment(array $cart, Request $request): void
    {
        try {
            $visitorId = $request->cookie('visitor_id');
            $userId = Auth::check() ? Auth::id() : null;

            if (! $visitorId && ! $userId) {
                return;
            }

            $existingCart = null;

            if ($visitorId) {
                $existingCart = AbandonedCart::where('visitor_id', $visitorId)
                    ->where('recovered', 0)
                    ->first();
            }

            if (! $existingCart && $userId) {
                $existingCart = AbandonedCart::where('user_id', $userId)
                    ->where('recovered', 0)
                    ->first();
            }

            $email = null;
            $phone = null;

            if ($userId) {
                $user = Auth::user();
                $email = $user->email;
                $phone = $user->mobile;
            }

            if (empty($cart)) {
                if ($existingCart) {
                    $existingCart->delete();
                }

                return;
            }

            DB::beginTransaction();
            try {
                if ($existingCart) {
                    $updateData = [
                        'visitor_id' => $visitorId,
                        'cart_data' => $cart,
                        'abandonment_stage' => 'cart',
                        'recovered' => 0,
                        'updated_at' => now(),
                    ];

                    if ($userId) {
                        $updateData['user_id'] = $userId;
                        $updateData['email'] = $email;
                        $updateData['phone'] = $phone;
                    }

                    $existingCart->update($updateData);
                } else {
                    AbandonedCart::create([
                        'user_id' => $userId,
                        'visitor_id' => $visitorId,
                        'cart_data' => $cart,
                        'email' => $email,
                        'phone' => $phone,
                        'abandonment_stage' => 'cart',
                        'reminder_count' => 0,
                        'recovered' => 0,
                    ]);
                }

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (\Exception $e) {
            Log::error('Error tracking cart abandonment', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}

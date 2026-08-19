<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\Order;
use App\Models\ProductVarient;
use App\Models\Setting;
use App\Models\TempOrder;
use App\Models\UserAddress;
use App\Services\AnalyticsService;
use App\Services\PayTokenService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class CheckoutController extends Controller
{
    protected PayTokenService $payTokenService;

    protected AnalyticsService $analyticsService;

    public function __construct(PayTokenService $payTokenService, AnalyticsService $analyticsService)
    {
        $this->payTokenService = $payTokenService;
        $this->analyticsService = $analyticsService;
    }

    /**
     * Build the full checkout summary: cart items, subtotal, delivery fee,
     * coupon discount, wallet redemption, and grand total. Re-validates
     * stock against the current cart cookie, adjusting it if needed.
     */
    public function summary(Request $request)
    {
        $cart = $this->readCart($request);

        if (empty($cart)) {
            return response()->json([
                'success' => false,
                'message' => 'Your cart is empty',
            ], 400);
        }

        $stockValidation = $this->validateCartStock($cart, $request);
        $cart = $stockValidation['updated_cart'];

        if (empty($cart)) {
            return response()->json([
                'success' => false,
                'message' => 'Your cart is empty',
                'stock_issues' => $stockValidation['issues'],
            ], 400);
        }

        [$subtotal, $items] = $this->buildCartItems($cart);

        $addressId = $request->query('addr_id');
        $state = null;
        if ($addressId) {
            $address = UserAddress::where('id', $addressId)
                ->where('user_id', Auth::id())
                ->first();
            $state = $address->state ?? null;
        }

        $shippingWaiver = (float) (Setting::find(6)->val ?? 0);
        $deliveryFee = $this->calculateDeliveryFees($subtotal, $shippingWaiver, $state, $cart);

        $couponData = json_decode($request->cookie('addcoupon'), true);
        [$couponDiscount, $couponCode] = $this->calculateCouponDiscount($couponData, $subtotal, $cart);

        $totalBeforeWallet = $subtotal + $deliveryFee - $couponDiscount;

        $walletAmount = 0;
        if ($request->query('wallet_taken') == '1') {
            $walletAmount = $this->calculateWalletRedemption($totalBeforeWallet);
        }

        $grandTotal = $totalBeforeWallet - $walletAmount;

        return response()->json([
            'success' => true,
            'items' => $items,
            'subtotal' => (float) $subtotal,
            'deliveryFee' => (float) $deliveryFee,
            'coupon' => $couponCode ? [
                'code' => $couponCode,
                'discount' => (float) $couponDiscount,
            ] : null,
            'walletAmount' => (float) $walletAmount,
            'walletBalance' => (float) (Auth::user()->wallet ?? 0),
            'total' => (float) max($grandTotal, 0),
            'stockIssues' => $stockValidation['issues'],
        ]);
    }

    /**
     * Create a temp_orders row for the current cart + address, then return a
     * signed redirect URL to femi9.in's isolated payment page.
     */
    public function placeOrder(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'addr_id' => 'required|exists:users_address,id',
                'note' => 'nullable|string|max:500',
                'wallet_taken' => 'sometimes|in:0,1',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $address = UserAddress::where('id', $request->addr_id)
                ->where('user_id', Auth::id())
                ->first();

            if (! $address) {
                return response()->json(['success' => false, 'message' => 'Address not found'], 404);
            }

            $cart = $this->readCart($request);
            if (empty($cart)) {
                return response()->json(['success' => false, 'message' => 'Your cart is empty'], 400);
            }

            $stockValidation = $this->validateCartStock($cart, $request);
            $cart = $stockValidation['updated_cart'];

            if (empty($cart) || ! $stockValidation['valid']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some items in your cart are no longer available. Please review your cart.',
                    'stockIssues' => $stockValidation['issues'],
                ], 400);
            }

            [$subtotal, $items] = $this->buildCartItems($cart);

            $shippingWaiver = (float) (Setting::find(6)->val ?? 0);
            $deliveryFee = $this->calculateDeliveryFees($subtotal, $shippingWaiver, $address->state, $cart);

            $couponData = json_decode($request->cookie('addcoupon'), true);
            [$couponDiscount, $couponCode] = $this->calculateCouponDiscount($couponData, $subtotal, $cart);

            $totalBeforeWallet = $subtotal + $deliveryFee - $couponDiscount;

            $walletAmount = 0;
            if ($request->wallet_taken == '1') {
                $walletAmount = $this->calculateWalletRedemption($totalBeforeWallet);
            }

            $totalAmount = max($totalBeforeWallet - $walletAmount, 1);

            DB::beginTransaction();
            try {
                $tempOrder = TempOrder::create([
                    'source' => 'lumi9',
                    'user_id' => Auth::id(),
                    'visitor_id' => $request->cookie('visitor_id'),
                    'razorpay_order_id' => '',
                    'total_amount' => $totalAmount,
                    'sub_total_amount' => $subtotal,
                    'delivery_fees' => $deliveryFee,
                    'product_order_list' => $items->toArray(),
                    'ship_address' => $address->toArray(),
                    'coupon' => $couponCode,
                    'coupon_price' => $couponDiscount,
                    'wallet_taken' => $walletAmount,
                    'notepay' => $request->note,
                    'order_status' => 'initiated',
                    'created_ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'expires_at' => now()->addMinutes(30),
                ]);

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

            $token = $this->payTokenService->make($tempOrder->id);
            $femi9PayUrl = rtrim((string) config('services.lumi9_pay.femi9_pay_url'), '/');

            return response()->json([
                'success' => true,
                'redirectUrl' => "{$femi9PayUrl}/lumi9-pay/{$token}",
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error in CheckoutController@placeOrder: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while placing your order.',
            ], 500);
        }
    }

    /**
     * Called when the browser returns from the femi9.in payment page.
     * Reads the temp_orders/orders row (shared DB) to report final status,
     * and clears the cart once payment is confirmed.
     */
    public function confirm(Request $request)
    {
        $tempOrderId = $this->payTokenService->verify((string) $request->query('order_token'));

        if (! $tempOrderId) {
            return response()->json(['success' => false, 'message' => 'Invalid or expired order reference.'], 400);
        }

        $tempOrder = TempOrder::where('id', $tempOrderId)
            ->where('user_id', Auth::id())
            ->first();

        if (! $tempOrder) {
            return response()->json(['success' => false, 'message' => 'Order not found.'], 404);
        }

        if ($tempOrder->order_status === 'payment_completed' || $tempOrder->order_status === 'completed') {
            $order = Order::where('temp_order_id', $tempOrder->id)->first();

            if ($order) {
                $this->analyticsService->trackOrderConversion(
                    (string) $order->id,
                    $tempOrder->visitor_id,
                    $request->fullUrl()
                );
            }

            $response = response()->json([
                'success' => true,
                'status' => 'paid',
                'orderId' => $order->id ?? null,
                'totalAmount' => (float) $tempOrder->total_amount,
            ]);

            return $response
                ->withCookie(cookie()->forget('addtocart'))
                ->withCookie(cookie()->forget('addcoupon'));
        }

        if ($tempOrder->order_status === 'payment_failed' || $tempOrder->order_status === 'expired') {
            // femi9.in's payment page calls /abandon before redirecting back
            // whenever the user cancels the Razorpay modal, storing the
            // reason ('cancelled' or 'payment_failed') in failure_reason.
            // A real verification/webhook failure stores the raw exception
            // message there instead — that's the fallback branch below.
            $reason = $tempOrder->failure_reason;

            $status = match (true) {
                $tempOrder->order_status === 'expired' => 'expired',
                $reason === 'cancelled' => 'cancelled',
                $reason === 'payment_failed' || $reason === 'unknown' => 'payment_failed',
                default => 'payment_failed',
            };

            $message = match ($status) {
                'cancelled' => 'Your payment was cancelled. No amount has been charged.',
                'expired' => 'Your payment session expired. No amount has been charged.',
                default => ($reason && ! in_array($reason, ['cancelled', 'payment_failed', 'unknown'], true))
                    ? $reason
                    : 'Your payment could not be completed. No amount has been charged.',
            };

            return response()->json([
                'success' => false,
                'status' => $status,
                'message' => $message,
            ]);
        }

        // Fallback only: if the browser reaches this page before femi9.in's
        // JS has called /abandon (e.g. user closes the tab entirely and
        // manually revisits this URL later), order_status is still
        // 'initiated' with no failure_reason set. expires_at is then the
        // only signal — past it, treat the attempt as abandoned.
        if ($tempOrder->expires_at && $tempOrder->expires_at->isPast()) {
            return response()->json([
                'success' => false,
                'status' => 'cancelled',
                'message' => 'Your payment was cancelled. No amount has been charged.',
            ]);
        }

        return response()->json([
            'success' => false,
            'status' => 'pending',
            'message' => 'Payment is still processing.',
        ]);
    }

    /**
     * List the logged-in user's saved addresses.
     */
    public function listAddresses(Request $request)
    {
        $addresses = UserAddress::where('user_id', Auth::id())
            ->where('status', 1)
            ->orderByDesc('primary_addrs')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'success' => true,
            'addresses' => $addresses,
        ]);
    }

    /**
     * Create or update a shipping address.
     */
    public function saveAddress(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'first_name' => 'required|string|max:50',
                'last_name' => 'nullable|string|max:50',
                'address' => 'required|string|max:255',
                'optional_name' => 'nullable|string|max:100',
                'city' => 'required|string|max:50',
                'country' => 'required|string|max:50',
                'state' => 'required|string|max:50',
                'pin_code' => 'required|digits:6',
                'mobile_num' => 'required|digits:10',
                'ship_email' => 'required|email',
                'addr_id' => 'sometimes|integer',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            DB::beginTransaction();
            try {
                $addressData = [
                    'user_id' => Auth::id(),
                    'fname' => $request->first_name,
                    'lname' => $request->last_name,
                    'address' => $request->address,
                    'optional_name' => $request->optional_name,
                    'city' => $request->city,
                    'country' => $request->country,
                    'state' => $request->state,
                    'pin_code' => $request->pin_code,
                    'ship_email' => $request->ship_email,
                    'mobile_num' => $request->mobile_num,
                ];

                if (! $request->addr_id) {
                    $address = UserAddress::create($addressData);
                    $addressId = $address->id;
                } else {
                    UserAddress::where('id', $request->addr_id)
                        ->where('user_id', Auth::id())
                        ->update($addressData);
                    $addressId = $request->addr_id;
                }

                $user = Auth::user();
                if ($user->email !== $request->ship_email) {
                    $user->update(['email' => $request->ship_email]);
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'address_id' => $addressId,
                ]);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error in CheckoutController@saveAddress: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while saving the address.',
            ], 500);
        }
    }

    /**
     * Validate and apply a coupon code, storing it in the addcoupon cookie.
     */
    public function applyCoupon(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'coupon' => 'required|string|max:50',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $today = Carbon::now();

            $coupon = Coupon::where('status', 1)
                ->where('name', $request->coupon)
                ->where('validity_from', '<=', $today)
                ->where('validity_to', '>=', $today)
                ->first();

            if (! $coupon) {
                return response()->json(['success' => false, 'message' => 'Invalid coupon']);
            }

            if ($coupon->one_time_global) {
                $usageCount = CouponUsage::where('coupon_id', $coupon->id)->count();
                if ($usageCount >= 1) {
                    return response()->json(['success' => false, 'message' => 'This coupon has already been used']);
                }
            }

            if ($coupon->one_time_per_user) {
                $userUsage = CouponUsage::where('coupon_id', $coupon->id)
                    ->where('user_id', Auth::id())
                    ->count();
                if ($userUsage >= 1) {
                    return response()->json(['success' => false, 'message' => 'You have already used this coupon']);
                }
            }

            $cart = $this->readCart($request);
            if (empty($cart)) {
                return response()->json(['success' => false, 'message' => 'Cart is empty']);
            }

            $cartVariantIds = array_map('strval', array_keys($cart));
            $couponProducts = $coupon->products ?? [];

            if (! empty($couponProducts)) {
                $eligible = array_intersect($cartVariantIds, array_map('strval', $couponProducts));
                if (empty($eligible)) {
                    return response()->json(['success' => false, 'message' => 'No eligible products for this coupon']);
                }
            }

            $response = response()->json([
                'success' => true,
                'coupon' => [
                    'name' => $coupon->name,
                    'offer_val' => (float) $coupon->offer_val,
                    'offer_type' => $coupon->offer_type,
                ],
            ]);

            return $response->withCookie(cookie('addcoupon', json_encode($coupon), 300));
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error in CheckoutController@applyCoupon: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while applying the coupon',
            ], 500);
        }
    }

    /**
     * Remove the applied coupon.
     */
    public function removeCoupon(Request $request)
    {
        $response = response()->json(['success' => true]);

        return $response->withCookie(cookie()->forget('addcoupon'));
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
     * Re-check cart quantities against current variant stock, removing
     * unavailable items and clamping quantities that exceed stock.
     */
    protected function validateCartStock(array $cart, Request $request): array
    {
        $hasIssue = false;
        $updatedCart = $cart;
        $issues = [];

        foreach ($cart as $variantId => $qty) {
            $variant = ProductVarient::where('id', $variantId)
                ->where('status', 1)
                ->first();

            if (! $variant) {
                unset($updatedCart[$variantId]);
                $hasIssue = true;
                $issues[] = 'Product no longer available';

                continue;
            }

            if ($variant->quantity <= 0) {
                unset($updatedCart[$variantId]);
                $hasIssue = true;
                $issues[] = 'Product out of stock';
            } elseif ($variant->quantity < $qty) {
                $updatedCart[$variantId] = $variant->quantity;
                $hasIssue = true;
                $issues[] = "Quantity reduced to available stock ({$variant->quantity})";
            }
        }

        if ($hasIssue) {
            cookie()->queue(cookie()->forever('addtocart', json_encode($updatedCart)));
        }

        return [
            'valid' => ! $hasIssue,
            'updated_cart' => $updatedCart,
            'issues' => $issues,
        ];
    }

    /**
     * Join cart variant IDs with live product data and compute the subtotal.
     */
    protected function buildCartItems(array $cart): array
    {
        $variants = ProductVarient::with('product')
            ->whereIn('id', array_keys($cart))
            ->where('status', 1)
            ->get();

        $subtotal = 0;
        $items = $variants->map(function (ProductVarient $variant) use ($cart, &$subtotal) {
            $qty = $cart[$variant->id] ?? 0;
            $price = $variant->price - $variant->discount;
            $lineTotal = $price * $qty;
            $subtotal += $lineTotal;

            return [
                'variantId' => $variant->id,
                // Femi9's shared Razorpay webhook (handlePaymentCaptured ->
                // updateProductInventory) reads product_order_list items by
                // 'pvid'/'qty'. Kept alongside variantId so this array still
                // works as the API response shape for the React frontend.
                'pvid' => $variant->id,
                'productId' => $variant->product_id,
                'name' => $variant->product->name ?? 'Unknown Product',
                'label' => $variant->label,
                'image' => $variant->product->image ?? null,
                'price' => (float) $price,
                'mrp' => (float) $variant->price,
                'qty' => $qty,
                'lineTotal' => (float) $lineTotal,
            ];
        })->values();

        return [$subtotal, $items];
    }

    /**
     * Free shipping above the waiver threshold. Otherwise the fee is based on
     * total cart weight: Tamil Nadu pays the base tiered rate, every other
     * state pays double. Weight tiers above 3kg stay capped at the 3kg rate.
     */
    protected function calculateDeliveryFees(float $subtotal, float $freeShippingThreshold, ?string $state, array $cart): float
    {
        if ($subtotal >= $freeShippingThreshold) {
            return 0;
        }

        if (! $state) {
            return 0;
        }

        $weightKg = $this->calculateCartWeightKg($cart);
        $baseRate = $this->tamilNaduRateForWeight($weightKg);

        $isTamilNadu = strcasecmp(trim($state), 'Tamil Nadu') === 0;

        return $isTamilNadu ? $baseRate : $baseRate * 2;
    }

    /**
     * Total cart weight in kilograms, from each variant's product.weight
     * (stored in grams) times its cart quantity.
     */
    protected function calculateCartWeightKg(array $cart): float
    {
        if (empty($cart)) {
            return 0;
        }

        $variants = ProductVarient::with('product')
            ->whereIn('id', array_keys($cart))
            ->where('status', 1)
            ->get();

        $totalGrams = $variants->sum(function (ProductVarient $variant) use ($cart) {
            $qty = $cart[$variant->id] ?? 0;

            return ($variant->product->weight ?? 0) * $qty;
        });

        return $totalGrams / 1000;
    }

    /**
     * Tamil Nadu's base weight-tiered rate: ₹30 up to 0.5kg, ₹50 up to 1kg,
     * ₹70 up to 2kg, ₹100 up to 3kg, capped at ₹100 beyond that.
     */
    protected function tamilNaduRateForWeight(float $weightKg): float
    {
        return match (true) {
            $weightKg <= 0.5 => 30,
            $weightKg <= 1 => 50,
            $weightKg <= 2 => 70,
            default => 100,
        };
    }

    /**
     * Apply a coupon (from the addcoupon cookie) against eligible cart items.
     */
    protected function calculateCouponDiscount(?array $couponData, float $subtotal, array $cart): array
    {
        if (empty($couponData['id'])) {
            return [0, null];
        }

        $coupon = Coupon::where('status', 1)->where('name', $couponData['name'])->first();

        if (! $coupon) {
            return [0, null];
        }

        $eligibleAmount = 0;
        $variants = ProductVarient::whereIn('id', array_keys($cart))->where('status', 1)->get();
        $couponProducts = $coupon->products ?? [];

        foreach ($variants as $variant) {
            $isEligible = empty($couponProducts) || in_array((string) $variant->id, array_map('strval', $couponProducts));

            if ($isEligible) {
                $price = $variant->price - $variant->discount;
                $eligibleAmount += $price * ($cart[$variant->id] ?? 0);
            }
        }

        if ($coupon->offer_type == 1) {
            $discount = round(($coupon->offer_val / 100) * $eligibleAmount, 2);
        } else {
            $discount = min((float) $coupon->offer_val, $eligibleAmount);
        }

        return [$discount, $coupon->name];
    }

    /**
     * Wallet redemption: a configured percentage of the total, capped by
     * the user's actual wallet balance and by the total itself.
     */
    protected function calculateWalletRedemption(float $total): float
    {
        $percentage = (float) (Setting::find(4)->val ?? 0);
        $allocatedAmount = (float) (Setting::find(5)->val ?? 0);

        $walletAmount = floor(($percentage / 100) * $allocatedAmount);
        $walletAmount = min($walletAmount, (float) (Auth::user()->wallet ?? 0));
        $walletAmount = min($walletAmount, $total);

        return max($walletAmount, 0);
    }
}

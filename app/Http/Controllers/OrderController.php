<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    /**
     * Paginated list of the logged-in user's Lumi9 orders, newest first.
     */
    public function index(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'page' => 'nullable|integer|min:0',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $page = (int) $request->input('page', 0);
            $perPage = 10;

            $orders = Order::lumi9()
                ->where('user_id', Auth::id())
                ->orderByDesc('created_at')
                ->skip($page * $perPage)
                ->take($perPage + 1)
                ->get();

            $hasMore = $orders->count() > $perPage;
            $orders = $orders->take($perPage);

            $totalOrders = Order::lumi9()->where('user_id', Auth::id())->count();

            return response()->json([
                'success' => true,
                'orders' => $orders->map(fn (Order $order) => $this->summarize($order))->values(),
                'hasMore' => $hasMore,
                'totalOrders' => $totalOrders,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Full detail for a single order: items, shipping address, payment,
     * and tracking info if the order has shipped.
     */
    public function show(int $id)
    {
        $order = Order::lumi9()
            ->with('shipping')
            ->where('user_id', Auth::id())
            ->where('id', $id)
            ->first();

        if (! $order) {
            return response()->json(['success' => false, 'message' => 'Order not found.'], 404);
        }

        $items = json_decode($order->product_order_list, true) ?? [];
        $shipAddress = json_decode($order->ship_address, true) ?? [];

        return response()->json([
            'success' => true,
            'order' => [
                'id' => $order->id,
                'placedAt' => $order->created_at,
                'items' => $items,
                'subtotal' => round((float) $order->sub_total_amount, 2),
                'deliveryFee' => round((float) $order->delivery_fees, 2),
                'coupon' => $order->coupon,
                'couponDiscount' => round((float) $order->coupon_price, 2),
                'walletUsed' => round((float) $order->wallet_taken, 2),
                'total' => round((float) $order->total_amount, 2),
                'paid' => (bool) $order->paid,
                'shippingAddress' => $shipAddress,
                'tracking' => $order->shipping ? [
                    'trackingId' => $order->shipping->tracking_id,
                    'carrierCode' => $order->shipping->carrier_code,
                ] : null,
            ],
        ]);
    }

    /**
     * Compact summary shape for the order list view.
     */
    protected function summarize(Order $order): array
    {
        $items = json_decode($order->product_order_list, true) ?? [];

        return [
            'id' => $order->id,
            'placedAt' => $order->created_at,
            'itemCount' => array_sum(array_column($items, 'qty')),
            'firstItemName' => $items[0]['name'] ?? null,
            'firstItemImage' => $items[0]['image'] ?? null,
            'total' => round((float) $order->total_amount, 2),
            'paid' => (bool) $order->paid,
        ];
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TempOrder extends Model
{
    protected $table = 'temp_orders';

    protected $fillable = [
        'source',
        'user_id',
        'visitor_id',
        'razorpay_order_id',
        'total_amount',
        'sub_total_amount',
        'delivery_fees',
        'product_order_list',
        'ship_address',
        'coupon',
        'coupon_price',
        'wallet_taken',
        'notepay',
        'order_status',
        'payment_response',
        'failure_reason',
        'created_ip',
        'user_agent',
        'expires_at',
    ];

    protected $casts = [
        'product_order_list' => 'array',
        'ship_address' => 'array',
        'payment_response' => 'array',
        'expires_at' => 'datetime',
        'total_amount' => 'decimal:2',
        'sub_total_amount' => 'decimal:2',
        'delivery_fees' => 'decimal:2',
        'coupon_price' => 'decimal:2',
        'wallet_taken' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

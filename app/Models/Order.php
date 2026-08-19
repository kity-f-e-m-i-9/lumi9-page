<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;

    protected $table = 'orders';

    protected $fillable = [
        'temp_order_id', 'user_id', 'visitor_id', 'razorpay_order_id',
        'razorpay_payment_id', 'total_amount', 'sub_total_amount',
        'delivery_fees', 'paid', 'product_order_list', 'ship_address',
        'coupon', 'coupon_price', 'wallet_taken', 'paid_to_wallet',
        'pay_res', 'notepay', 'status',
    ];

    protected $hidden = ['deleted_at'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function tempOrder()
    {
        return $this->belongsTo(TempOrder::class, 'temp_order_id');
    }

    public function shipping()
    {
        return $this->hasOne(OrderShip::class, 'order_id');
    }

    /**
     * Only orders that originated from Lumi9's checkout, not Femi9's.
     */
    public function scopeLumi9(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->whereHas('tempOrder', function ($q) {
            $q->where('source', 'lumi9');
        });
    }
}

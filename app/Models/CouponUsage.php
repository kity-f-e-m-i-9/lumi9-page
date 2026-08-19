<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CouponUsage extends Model
{
    protected $table = 'coupon_usages';

    protected $fillable = ['coupon_id', 'user_id', 'order_id'];

    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }
}

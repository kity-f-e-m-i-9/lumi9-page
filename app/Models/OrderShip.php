<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrderShip extends Model
{
    use SoftDeletes;

    protected $table = 'order_shipping';

    protected $fillable = ['order_id', 'tracking_id', 'carrier_code'];

    protected $hidden = ['deleted_at'];

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }
}

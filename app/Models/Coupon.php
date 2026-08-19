<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Coupon extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'coupons';

    protected $fillable = [
        'name', 'offer_val', 'offer_type', 'validity_from', 'validity_to',
        'status', 'one_time_global', 'one_time_per_user', 'products',
    ];

    protected $casts = [
        'products' => 'array',
    ];

    protected $hidden = ['deleted_at'];
}

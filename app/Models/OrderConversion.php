<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrderConversion extends Model
{
    use SoftDeletes;

    protected $table = 'lumi9_order_conversions';

    protected $fillable = [
        'visitor_id', 'session_id', 'order_id',
        'first_landed_url', 'referring_url', 'conversion_url', 'utm_data',
    ];

    protected $casts = [
        'utm_data' => 'array',
    ];
}

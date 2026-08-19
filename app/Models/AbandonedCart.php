<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AbandonedCart extends Model
{
    protected $table = 'abandoned_carts';

    protected $fillable = [
        'user_id',
        'visitor_id',
        'cart_data',
        'temp_order_id',
        'email',
        'phone',
        'abandonment_stage',
        'reminder_sent',
        'reminder_count',
        'recovered',
        'last_reminder_at',
        'recovered_at',
        'recovery_type',
    ];

    protected $casts = [
        'cart_data' => 'array',
        'reminder_sent' => 'boolean',
        'last_reminder_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

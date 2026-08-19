<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsappOTP extends Model
{
    protected $table = 'whatsapp_otps';

    protected $fillable = ['mobile', 'otp', 'expires_at'];

    protected $casts = [
        'expires_at' => 'datetime',
    ];
}

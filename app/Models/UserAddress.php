<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UserAddress extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'users_address';

    protected $fillable = [
        'user_id', 'fname', 'lname', 'address', 'optional_name',
        'city', 'country', 'state', 'pin_code', 'mobile_num',
        'ship_email', 'primary_addrs', 'status',
    ];

    protected $hidden = ['deleted_at'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

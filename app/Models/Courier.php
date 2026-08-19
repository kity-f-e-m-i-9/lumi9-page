<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Courier extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'couriers';

    protected $fillable = ['name', 'price', 'status'];

    protected $hidden = ['deleted_at'];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'products';

    protected $fillable = [
        'name', 'category_id', 'sub_category_id', 'link_code', 'sku_name',
        'image', 'image1', 'image2', 'image4', 'description', 'how_to_use',
        'meta_title', 'meta_descp', 'meta_keyword', 'length', 'breadth',
        'height', 'weight', 'status',
    ];

    protected $hidden = ['deleted_at'];

    public function variants()
    {
        return $this->hasMany(ProductVarient::class, 'product_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AnalyticsPageView extends Model
{
    use SoftDeletes;

    protected $table = 'lumi9_analytics_page_views';

    protected $fillable = ['visitor_id', 'session_id', 'url', 'referrer', 'utm_data'];

    protected $casts = [
        'utm_data' => 'array',
    ];
}

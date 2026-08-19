<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnalyticsVisitor extends Model
{
    protected $table = 'lumi9_analytics_visitors';

    protected $primaryKey = 'visitor_id';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'visitor_id', 'last_visit', 'visit_count', 'ip_address',
        'user_agent', 'is_bot', 'device_type', 'language',
    ];

    protected $casts = [
        'is_bot' => 'boolean',
        'last_visit' => 'datetime',
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AnalyticsSession extends Model
{
    use SoftDeletes;

    protected $table = 'lumi9_analytics_sessions';

    protected $primaryKey = 'session_id';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = ['session_id', 'visitor_id', 'last_activity', 'screen_resolution'];

    protected $casts = [
        'last_activity' => 'datetime',
    ];
}

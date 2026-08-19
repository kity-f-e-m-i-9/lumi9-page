<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lumi9_analytics_sessions', function (Blueprint $table) {
            $table->string('session_id')->primary();
            $table->string('visitor_id')->index();
            $table->timestamp('last_activity')->useCurrentOnUpdate()->useCurrent();
            $table->string('screen_resolution')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lumi9_analytics_sessions');
    }
};

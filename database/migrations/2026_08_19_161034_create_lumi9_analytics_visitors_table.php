<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lumi9_analytics_visitors', function (Blueprint $table) {
            $table->string('visitor_id')->primary();
            $table->timestamp('last_visit')->useCurrentOnUpdate()->useCurrent();
            $table->unsignedInteger('visit_count')->default(1);
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->boolean('is_bot')->default(false);
            $table->string('device_type')->nullable();
            $table->string('language')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lumi9_analytics_visitors');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lumi9_analytics_page_views', function (Blueprint $table) {
            $table->id();
            $table->string('visitor_id')->index();
            $table->string('session_id')->index();
            $table->text('url');
            $table->text('referrer')->nullable();
            $table->json('utm_data')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lumi9_analytics_page_views');
    }
};

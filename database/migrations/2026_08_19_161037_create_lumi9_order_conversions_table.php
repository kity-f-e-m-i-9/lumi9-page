<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lumi9_order_conversions', function (Blueprint $table) {
            $table->id();
            $table->string('visitor_id');
            $table->string('session_id');
            $table->string('order_id')->unique();
            $table->text('first_landed_url')->nullable();
            $table->text('referring_url')->nullable();
            $table->text('conversion_url')->nullable();
            $table->json('utm_data')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lumi9_order_conversions');
    }
};

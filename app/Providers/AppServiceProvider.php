<?php

namespace App\Providers;

use App\Auth\PhoneVerifiedUserProvider;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Auth::provider('phone_verified', function ($app, array $config) {
            return new PhoneVerifiedUserProvider($app['hash'], $config['model']);
        });
    }
}

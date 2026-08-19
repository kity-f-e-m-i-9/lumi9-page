<?php

use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\InstagramController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\OrderController;
use Illuminate\Support\Facades\Route;

Route::post('/whatsapp-check', [LoginController::class, 'whatsappCheck'])->name('user.whatsapp.check');
Route::post('/whatsapp-login-check', [LoginController::class, 'whatsappLoginCheck'])->name('user.whatsapp.login');
Route::post('/whatsapp/verify-otp', [LoginController::class, 'verifyWhatsappOTP'])->name('user.whatsapp.verify');
Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth:web')->name('user.logout');
Route::get('/me', [LoginController::class, 'me'])->middleware('auth:web');

Route::get('/instagram/feed', [InstagramController::class, 'feed']);
Route::post('/analytics/pageview', [AnalyticsController::class, 'pageview']);

Route::get('/products/diapers', [CartController::class, 'products']);
Route::post('/cart/add', [CartController::class, 'add']);
Route::get('/cart', [CartController::class, 'list']);
Route::get('/cart/count', [CartController::class, 'count']);
Route::post('/cart/clear', [CartController::class, 'clear']);

Route::middleware('auth:web')->group(function () {
    Route::get('/checkout/summary', [CheckoutController::class, 'summary']);
    Route::get('/addresses', [CheckoutController::class, 'listAddresses']);
    Route::post('/addresses', [CheckoutController::class, 'saveAddress']);
    Route::post('/coupon/apply', [CheckoutController::class, 'applyCoupon']);
    Route::post('/coupon/remove', [CheckoutController::class, 'removeCoupon']);
    Route::post('/checkout/place-order', [CheckoutController::class, 'placeOrder']);
    Route::get('/checkout/confirm', [CheckoutController::class, 'confirm']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
});

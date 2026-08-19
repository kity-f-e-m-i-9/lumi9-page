<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Ensures every request has a stable visitor_id (cookie, 1 year) and an
 * analytics_session_id (Laravel session) so both the explicit pageview
 * endpoint and checkout/cart code can read consistent identifiers. Does
 * not write to the database — that only happens when the frontend
 * explicitly reports a page view via AnalyticsController::pageview.
 */
class EnsureVisitorIdentity
{
    public function handle(Request $request, Closure $next)
    {
        $visitorId = $request->cookie('visitor_id') ?? (string) Str::uuid();

        if ($request->hasSession() && ! $request->session()->has('analytics_session_id')) {
            $request->session()->put('analytics_session_id', (string) Str::uuid());
        }

        $response = $next($request);

        if (! $request->cookie('visitor_id')) {
            $response->withCookie(cookie('visitor_id', $visitorId, 60 * 24 * 365));
        }

        return $response;
    }
}

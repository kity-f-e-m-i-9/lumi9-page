<?php

namespace App\Http\Controllers;

use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AnalyticsController extends Controller
{
    protected AnalyticsService $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Called once by the frontend per real route change (not per API call).
     * Records the view and captures any UTM params on the URL.
     */
    public function pageview(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'url' => 'required|string|max:2048',
                'referrer' => 'nullable|string|max:2048',
                'screen_resolution' => 'nullable|string|max:20',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $visitorId = $request->cookie('visitor_id');
            $sessionId = $request->session()->get('analytics_session_id');

            if (! $visitorId || ! $sessionId) {
                return response()->json(['success' => false, 'message' => 'Missing visitor identity.'], 400);
            }

            $this->analyticsService->trackPageView([
                'visitor_id' => $visitorId,
                'session_id' => $sessionId,
                'url' => $request->input('url'),
                'referrer' => $request->input('referrer'),
                'screen_resolution' => $request->input('screen_resolution'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'is_bot' => $this->looksLikeBot($request->userAgent()),
                'device_type' => $this->deviceType($request->userAgent()),
                'language' => $request->getPreferredLanguage(),
            ]);

            return response()->json(['success' => true]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
        }
    }

    protected function looksLikeBot(?string $userAgent): bool
    {
        if (! $userAgent) {
            return false;
        }

        return (bool) preg_match('/bot|crawl|spider|slurp|facebookexternalhit/i', $userAgent);
    }

    protected function deviceType(?string $userAgent): string
    {
        $ua = strtolower($userAgent ?? '');

        if (preg_match('/(tablet|ipad|playbook)|(android(?!.*(mobi|opera mini)))/', $ua)) {
            return 'tablet';
        }

        if (preg_match('/(up.browser|up.link|mmp|symbian|smartphone|midp|wap|phone|android|iemobile)/', $ua)) {
            return 'mobile';
        }

        return 'desktop';
    }
}

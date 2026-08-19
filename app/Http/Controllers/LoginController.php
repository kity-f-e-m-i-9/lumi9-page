<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\User;
use App\Models\WhatsappOTP;
use App\Services\AvatarService;
use App\Services\WhatsAppService;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;

class LoginController extends Controller
{
    protected $avatarService;

    protected $whatsAppService;

    public function __construct(AvatarService $avatarService, WhatsAppService $whatsAppService)
    {
        $this->avatarService = $avatarService;
        $this->whatsAppService = $whatsAppService;
    }

    /**
     * Redirect user to Google OAuth
     */
    public function redirectToGoogle()
    {
        try {
            return Socialite::driver('google')->redirect();
        } catch (\Exception $e) {
            Log::error('Error in LoginController@redirectToGoogle: '.$e->getMessage());

            return redirect(config('app.frontend_url', '/').'?login_error=google_unavailable');
        }
    }

    /**
     * Handle Google OAuth callback
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            DB::beginTransaction();
            try {
                $googleUser = Socialite::driver('google')->user();

                $email = $googleUser->getEmail();
                $name = $googleUser->getName();

                $user = User::where('email', $email)->first();

                if (! $user) {
                    $avatarFileName = $this->avatarService->generateAvatar($name);
                    $loginBonus = Setting::where('id', 5)->value('val') ?? 0;

                    $user = User::create([
                        'name' => $name,
                        'email' => $email,
                        'password' => null,
                        'signup_type' => 2,
                        'image' => $avatarFileName,
                        'phone_verified_at' => now(),
                        'wallet' => $loginBonus,
                    ]);
                }

                Auth::login($user);
                DB::commit();

                return redirect(config('app.frontend_url', '/').'?login=success');
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (\Exception $e) {
            Log::error('Error in LoginController@handleGoogleCallback: '.$e->getMessage());

            return redirect(config('app.frontend_url', '/').'?login_error=google_failed');
        }
    }

    /**
     * Send WhatsApp OTP for signup
     */
    public function whatsappCheck(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'username' => [
                    'required',
                    'string',
                    'max:255',
                    'regex:/^[a-zA-Z0-9]+(?:\s[a-zA-Z0-9]+)*$/',
                ],
                'mobile' => [
                    'required',
                    'string',
                    'size:10',
                    'regex:/^[0-9]+$/',
                    'unique:users',
                ],
                'email' => [
                    'required',
                    'string',
                    'email:rfc',
                    'max:255',
                    'unique:users',
                ],
            ], [
                'username.regex' => 'Username must contain only alphanumeric characters and single spaces between words.',
                'mobile.unique' => 'This mobile number is already registered.',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            DB::beginTransaction();
            try {
                $otp = $this->generateOTP();
                $data = new \stdClass();
                $data->name = strip_tags($request->username);
                $data->mobile = preg_replace('/[^0-9]/', '', $request->mobile);
                $data->email = filter_var(strtolower(trim($request->email)), FILTER_SANITIZE_EMAIL);

                $result = $this->registerOrLoginUser($data, 4);

                WhatsappOTP::updateOrCreate(
                    ['mobile' => $request->mobile],
                    [
                        'otp' => $otp,
                        'expires_at' => Carbon::now()->addMinutes(10),
                    ]
                );

                $phoneNumber = '91'.$request->mobile;
                $templateId = 'signup_otp';
                $variables = [
                    ['name' => 'customername', 'value' => $request->username],
                    ['name' => 'otp', 'value' => $otp],
                ];

                $result = $this->whatsAppService->sendTemplateMessage(
                    $phoneNumber,
                    $templateId,
                    $variables
                );

                if (! isset($result['status']) || $result['status'] !== '1') {
                    throw new \Exception($result['message'] ?? 'Failed to send WhatsApp OTP');
                }

                DB::commit();

                Log::info('WhatsApp OTP sent successfully', [
                    'mobile' => $request->mobile,
                    'template_id' => $templateId,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'OTP sent successfully via WhatsApp.',
                ]);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
        } catch (QueryException $e) {
            Log::error('Database error in LoginController@whatsappCheck: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while processing WhatsApp verification.',
            ], 500);
        } catch (\Exception $e) {
            Log::error('Error in LoginController@whatsappCheck: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to send OTP via WhatsApp. Please try again.',
            ], 500);
        }
    }

    /**
     * Send WhatsApp OTP for login
     */
    public function whatsappLoginCheck(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'mobile' => [
                    'required',
                    'string',
                    'size:10',
                    'regex:/^[0-9]+$/',
                ],
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            DB::beginTransaction();
            try {
                $user = User::where('mobile', $request->mobile)
                    ->whereIn('signup_type', [2, 4])
                    ->first();

                if (! $user) {
                    throw ValidationException::withMessages([
                        'mobile' => ['No WhatsApp account found with this mobile number.'],
                    ]);
                }

                $otp = $this->generateOTP();

                WhatsappOTP::updateOrCreate(
                    ['mobile' => $request->mobile],
                    [
                        'otp' => $otp,
                        'expires_at' => Carbon::now()->addMinutes(10),
                    ]
                );

                $phoneNumber = '91'.$request->mobile;
                $templateId = 'login_otp';
                $variables = [
                    ['name' => 'customername', 'value' => $user->name],
                    ['name' => 'otp', 'value' => $otp],
                ];

                $result = $this->whatsAppService->sendTemplateMessage(
                    $phoneNumber,
                    $templateId,
                    $variables
                );

                if (! isset($result['status']) || $result['status'] !== '1') {
                    throw new \Exception($result['message'] ?? 'Failed to send WhatsApp OTP');
                }

                DB::commit();

                Log::info('WhatsApp login OTP sent successfully', [
                    'mobile' => $request->mobile,
                    'template_id' => $templateId,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'OTP sent successfully via WhatsApp.',
                ]);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
        } catch (QueryException $e) {
            Log::error('Database error in LoginController@whatsappLoginCheck: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while processing WhatsApp login.',
            ], 500);
        } catch (\Exception $e) {
            Log::error('Error in LoginController@whatsappLoginCheck: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to send OTP via WhatsApp. Please try again.',
            ], 500);
        }
    }

    /**
     * Verify WhatsApp OTP and log the user in
     */
    public function verifyWhatsappOTP(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'mobile' => 'required|string|size:10',
                'otp' => 'required|string|size:6',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            DB::beginTransaction();
            try {
                $whatsappOTP = WhatsappOTP::where('mobile', $request->mobile)
                    ->where('otp', $request->otp)
                    ->where('expires_at', '>', Carbon::now())
                    ->first();

                if (! $whatsappOTP) {
                    throw ValidationException::withMessages([
                        'otp' => ['Invalid or expired OTP.'],
                    ]);
                }

                $user = User::where('mobile', $request->mobile)->first();

                if (! $user) {
                    throw ValidationException::withMessages([
                        'mobile' => ['No account found with this mobile number.'],
                    ]);
                }

                $user->phone_verified_at = Carbon::now();
                $user->save();

                Auth::login($user);
                $whatsappOTP->delete();

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'WhatsApp verification successful.',
                    'user' => $user->only(['id', 'name', 'mobile', 'email']),
                ]);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
        } catch (QueryException $e) {
            Log::error('Database error in LoginController@verifyWhatsappOTP: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while verifying OTP.',
            ], 500);
        } catch (\Exception $e) {
            Log::error('Error in LoginController@verifyWhatsappOTP: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while processing your request.',
            ], 500);
        }
    }

    /**
     * Log out the user
     */
    public function logout(Request $request)
    {
        try {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully.',
            ]);
        } catch (\Exception $e) {
            Log::error('Error in LoginController@logout: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while logging out.',
            ], 500);
        }
    }

    /**
     * Return the currently authenticated user
     */
    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'user' => $request->user()?->only(['id', 'name', 'mobile', 'email', 'image', 'dob_date', 'anniversary_date', 'wallet', 'created_at']),
        ]);
    }

    /**
     * Generate a 6-digit OTP
     */
    protected function generateOTP()
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Register a new WhatsApp user if one doesn't already exist
     */
    protected function registerOrLoginUser($data, $signupType)
    {
        $user = User::where('mobile', $data->mobile)->first();

        if (! $user) {
            $avatarFileName = $this->avatarService->generateAvatar($data->name);
            $loginBonus = Setting::where('id', 5)->value('val') ?? 0;

            $user = User::create([
                'name' => $data->name,
                'mobile' => $data->mobile,
                'email' => $data->email,
                'password' => null,
                'signup_type' => $signupType,
                'image' => $avatarFileName,
                'wallet' => $loginBonus,
            ]);

            return ['success' => true, 'message' => 'User registered successfully'];
        }

        return ['success' => false, 'message' => 'User already exists'];
    }
}

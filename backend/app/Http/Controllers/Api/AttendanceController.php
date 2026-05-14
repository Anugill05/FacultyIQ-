<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AttendanceController extends Controller
{
    /**
     * Get attendance records for a teacher
     */
    public function getTeacherAttendance(string $teacherId)
    {
        $teacher = User::where('role', 'teacher')->findOrFail($teacherId);

        $attendance = Attendance::where('teacher_id', $teacherId)
            ->orderByDesc('year')
            ->orderByDesc('month')
            ->get();

        $avgAttendance = $attendance->avg('attendance_percentage');

        return response()->json([
            'success' => true,
            'data' => [
                'teacher'        => $teacher->only(['id', 'name', 'department', 'employee_id']),
                'attendance'     => $attendance,
                'avg_attendance' => round($avgAttendance ?? 0, 2),
            ],
        ]);
    }

    /**
     * Mark / update attendance for a teacher (admin only)
     */
    public function markAttendance(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'teacher_id'       => 'required|string',
            'month'            => 'required|integer|min:1|max:12',
            'year'             => 'required|integer|min:2020|max:2030',
            'total_working_days' => 'required|integer|min:1|max:31',
            'days_present'     => 'required|integer|min:0',
            'leaves_taken'     => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $teacher = User::where('role', 'teacher')->find($request->teacher_id);
        if (!$teacher) {
            return response()->json(['success' => false, 'message' => 'Teacher not found'], 404);
        }

        $total    = $request->total_working_days;
        $present  = min($request->days_present, $total);
        $absent   = $total - $present;
        $pct      = round(($present / $total) * 100, 2);

        $record = Attendance::updateOrCreate(
            [
                'teacher_id' => $request->teacher_id,
                'month'      => $request->month,
                'year'       => $request->year,
            ],
            [
                'total_working_days'    => $total,
                'days_present'          => $present,
                'days_absent'           => $absent,
                'leaves_taken'          => $request->leaves_taken ?? 0,
                'attendance_percentage' => $pct,
                'marked_by'             => auth()->id(),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Attendance recorded',
            'data'    => $record,
        ]);
    }

    /**
     * Bulk attendance for all teachers for a month
     */
    public function bulkAttendance(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'month'   => 'required|integer|min:1|max:12',
            'year'    => 'required|integer|min:2020|max:2030',
            'records' => 'required|array',
            'records.*.teacher_id'       => 'required|string',
            'records.*.total_working_days' => 'required|integer|min:1',
            'records.*.days_present'     => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $saved = 0;
        foreach ($request->records as $rec) {
            $total   = $rec['total_working_days'];
            $present = min($rec['days_present'], $total);
            $pct     = round(($present / $total) * 100, 2);

            Attendance::updateOrCreate(
                [
                    'teacher_id' => $rec['teacher_id'],
                    'month'      => $request->month,
                    'year'       => $request->year,
                ],
                [
                    'total_working_days'    => $total,
                    'days_present'          => $present,
                    'days_absent'           => $total - $present,
                    'leaves_taken'          => $rec['leaves_taken'] ?? 0,
                    'attendance_percentage' => $pct,
                    'marked_by'             => auth()->id(),
                ]
            );
            $saved++;
        }

        return response()->json([
            'success' => true,
            'message' => "Attendance saved for {$saved} teachers",
        ]);
    }
}

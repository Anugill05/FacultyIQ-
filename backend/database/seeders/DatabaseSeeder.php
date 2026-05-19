<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Feedback;
use App\Models\Achievement;
use App\Models\Workshop;
use App\Models\WorkshopParticipant;
use App\Models\Attendance;
use App\Models\PerformanceScore;
use App\Models\Announcement;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedAdmin();
        $teachers = $this->seedTeachers();
        $students = $this->seedStudents();
        $workshops = $this->seedWorkshops();
        $this->seedAchievements($teachers);
        $this->seedFeedbacks($teachers, $students);
        $this->seedAttendance($teachers);
        $this->seedWorkshopParticipants($teachers, $workshops);
        $this->seedPerformanceScores($teachers);
        $this->seedAnnouncements();

        $this->command->info('✅ FacultyUp database seeded successfully!');
    }

    private function seedAdmin(): void
    {
        User::create([
            'name' => 'Rajesh Kumar',
            'email' => 'admin@lpu.in',
            'password' => Hash::make('Admin@123'),
            'role' => 'admin',
            'phone' => '9876543210',
            'department' => 'Administration',
            'designation' => 'Dean of Faculty Development',
            'employee_id' => 'ADM001',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
    }

    private function seedTeachers(): array
    {
        $teachers = [
            [
                'name' => 'Priya Sharma',
                'email' => 'priya.sharma@lpu.in',
                'department' => 'Computer Science',
                'designation' => 'Assistant Professor',
                'employee_id' => 'CSE001',
                'qualification' => 'Ph.D. in Machine Learning',
                'specialization' => 'Artificial Intelligence & Machine Learning',
                'experience_years' => 8,
                'bio' => 'Passionate researcher with 8+ years of experience in AI/ML. Published 15+ research papers.',
                'phone' => '9876543211',
            ],
            [
                'name' => 'Amit Verma',
                'email' => 'amit.verma@lpu.in',
                'department' => 'Computer Science',
                'designation' => 'Associate Professor',
                'employee_id' => 'CSE002',
                'qualification' => 'Ph.D. in Computer Networks',
                'specialization' => 'Networking & Cybersecurity',
                'experience_years' => 14,
                'bio' => 'Expert in network security and cloud computing with industry experience at Google.',
                'phone' => '9876543212',
            ],
            [
                'name' => 'Sunita Patel',
                'email' => 'sunita.patel@lpu.in',
                'department' => 'Mathematics',
                'designation' => 'Professor',
                'employee_id' => 'MATH001',
                'qualification' => 'Ph.D. in Applied Mathematics',
                'specialization' => 'Statistics & Data Analysis',
                'experience_years' => 20,
                'bio' => 'Renowned mathematician specializing in statistical modeling and probability theory.',
                'phone' => '9876543213',
            ],
            [
                'name' => 'Ravi Gupta',
                'email' => 'ravi.gupta@lpu.in',
                'department' => 'Electronics',
                'designation' => 'Assistant Professor',
                'employee_id' => 'ECE001',
                'qualification' => 'Ph.D. in VLSI Design',
                'specialization' => 'VLSI & Embedded Systems',
                'experience_years' => 6,
                'bio' => 'Young researcher with expertise in chip design and IoT systems.',
                'phone' => '9876543214',
            ],
            [
                'name' => 'Meena Joshi',
                'email' => 'meena.joshi@lpu.in',
                'department' => 'Management',
                'designation' => 'Professor',
                'employee_id' => 'MBA001',
                'qualification' => 'Ph.D. in Business Administration',
                'specialization' => 'Strategic Management & Entrepreneurship',
                'experience_years' => 18,
                'bio' => 'Business consultant and academician with expertise in startup ecosystems.',
                'phone' => '9876543215',
            ],
            [
                'name' => 'Kiran Bhatnagar',
                'email' => 'kiran.bhatnagar@lpu.in',
                'department' => 'Physics',
                'designation' => 'Associate Professor',
                'employee_id' => 'PHY001',
                'qualification' => 'Ph.D. in Quantum Physics',
                'specialization' => 'Quantum Mechanics & Optics',
                'experience_years' => 12,
                'bio' => 'Quantum physicist with research publications in Nature and Science journals.',
                'phone' => '9876543216',
            ],
        ];

        $created = [];
        foreach ($teachers as $t) {
            $created[] = User::create([
                ...$t,
                'password' => Hash::make('Teacher@123'),
                'role' => 'teacher',
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
        }

        return $created;
    }

    private function seedStudents(): array
    {
        $students = [];
        $departments = ['Computer Science', 'Electronics', 'Mathematics', 'Management', 'Physics'];

        for ($i = 1; $i <= 20; $i++) {
            $students[] = User::create([
                'name' => fake()->firstName() . ' ' . fake()->lastName(),
                'email' => "student{$i}@lpu.in",
                'password' => Hash::make('Student@123'),
                'role' => 'student',
                'student_id' => "LPU" . str_pad($i, 5, '0', STR_PAD_LEFT),
                'department' => $departments[array_rand($departments)],
                'phone' => '98765' . rand(10000, 99999),
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
        }

        return $students;
    }

    private function seedWorkshops(): array
    {
        $adminId = User::where('role', 'admin')->first()->id;
        $workshops = [
            [
                'title' => 'Advanced Pedagogy Techniques for Higher Education',
                'description' => 'A comprehensive workshop covering modern teaching methodologies, active learning strategies, and student engagement techniques.',
                'category' => 'pedagogical',
                'facilitator' => 'Dr. Rahul Mehta (IIT Delhi)',
                'start_date' => Carbon::now()->addDays(8),
                'end_date' => Carbon::now()->addDays(8),
                'start_time' => '10:00',
                'end_time' => '13:00',
                'venue' => 'Seminar Hall A, Block 32',
                'mode' => 'offline',
                'max_participants' => 40,
                'registration_deadline' => Carbon::now()->addDays(5),
                'status' => 'upcoming',
                'points_awarded' => 20,
                'certificate_provided' => true,
                'tags' => ['pedagogy', 'teaching', 'higher education'],
            ],
            [
                'title' => 'Research Methodology & Publication Strategies',
                'description' => 'Learn how to write impactful research papers, navigate Scopus/SCI journals, and build a strong publication profile.',
                'category' => 'research',
                'facilitator' => 'Prof. Anand Krishnamurthy (IISc)',
                'start_date' => Carbon::now()->addDays(13),
                'end_date' => Carbon::now()->addDays(14),
                'start_time' => '14:00',
                'end_time' => '17:00',
                'venue' => 'Online via Zoom',
                'mode' => 'online',
                'max_participants' => 100,
                'registration_deadline' => Carbon::now()->addDays(10),
                'status' => 'upcoming',
                'points_awarded' => 25,
                'certificate_provided' => true,
                'tags' => ['research', 'publication', 'Scopus'],
            ],
            [
                'title' => 'Effective Communication & Leadership Skills',
                'description' => 'Develop your leadership communication skills through interactive exercises and real-world scenarios.',
                'category' => 'soft_skills',
                'facilitator' => 'Ms. Prerna Sharma (Toastmasters International)',
                'start_date' => Carbon::now()->addDays(21),
                'end_date' => Carbon::now()->addDays(21),
                'start_time' => '11:00',
                'end_time' => '14:30',
                'venue' => 'Conference Room, Admin Block',
                'mode' => 'offline',
                'max_participants' => 30,
                'registration_deadline' => Carbon::now()->addDays(18),
                'status' => 'upcoming',
                'points_awarded' => 15,
                'certificate_provided' => true,
                'tags' => ['communication', 'leadership', 'soft skills'],
            ],
            [
                'title' => 'Python for Data Science & AI Applications',
                'description' => 'Hands-on workshop on Python programming for data analysis, visualization, and AI model development.',
                'category' => 'technical',
                'facilitator' => 'Dr. Vikash Singh (Amazon)',
                'start_date' => Carbon::now()->subDays(15),
                'end_date' => Carbon::now()->subDays(14),
                'start_time' => '09:00',
                'end_time' => '17:00',
                'venue' => 'Computer Lab 4, Block 10',
                'mode' => 'offline',
                'max_participants' => 25,
                'registration_deadline' => Carbon::now()->subDays(18),
                'status' => 'completed',
                'points_awarded' => 30,
                'certificate_provided' => true,
                'tags' => ['python', 'data science', 'AI'],
            ],
            [
                'title' => 'Outcome Based Education (OBE) Framework',
                'description' => 'Understanding and implementing OBE framework in curriculum design and assessment.',
                'category' => 'pedagogical',
                'facilitator' => 'Prof. Suresh Babu (NAAC Consultant)',
                'start_date' => Carbon::now()->subDays(30),
                'end_date' => Carbon::now()->subDays(29),
                'start_time' => '10:00',
                'end_time' => '16:00',
                'venue' => 'Seminar Hall B, Block 32',
                'mode' => 'hybrid',
                'max_participants' => 50,
                'registration_deadline' => Carbon::now()->subDays(33),
                'status' => 'completed',
                'points_awarded' => 20,
                'certificate_provided' => true,
                'tags' => ['OBE', 'curriculum', 'assessment'],
            ],
        ];

        $created = [];
        foreach ($workshops as $w) {
            $created[] = Workshop::create([
                ...$w,
                'current_participants' => 0,
                'created_by' => $adminId,
            ]);
        }

        return $created;
    }

    private function seedAchievements(array $teachers): void
    {
        $achievementsData = [
            ['title' => 'Best Paper Award - IEEE ICCA 2024', 'category' => 'award', 'points' => 20, 'org' => 'IEEE'],
            ['title' => 'Machine Learning Research Publication in Springer', 'category' => 'publication', 'points' => 25, 'org' => 'Springer Nature'],
            ['title' => 'AWS Certified Solutions Architect', 'category' => 'certification', 'points' => 15, 'org' => 'Amazon Web Services'],
            ['title' => 'Patent: Intelligent Traffic Management System', 'category' => 'patent', 'points' => 30, 'org' => 'IPO India'],
            ['title' => 'Keynote Speaker - International AI Conference', 'category' => 'conference', 'points' => 15, 'org' => 'ICCAI 2024'],
            ['title' => 'AICTE-funded Research Project on NLP', 'category' => 'project', 'points' => 20, 'org' => 'AICTE India'],
        ];

        foreach ($teachers as $i => $teacher) {
            $count = rand(2, 4);
            $selected = array_slice($achievementsData, 0, $count);

            foreach ($selected as $ach) {
                Achievement::create([
                    'teacher_id' => $teacher->id,
                    'title' => $ach['title'],
                    'description' => "Achievement: {$ach['title']} recognized internationally.",
                    'category' => $ach['category'],
                    'date_achieved' => Carbon::now()->subMonths(rand(1, 12)),
                    'issuing_organization' => $ach['org'],
                    'points' => $ach['points'],
                    'verified' => rand(0, 1) === 1,
                    'verified_at' => rand(0, 1) === 1 ? Carbon::now()->subDays(rand(1, 30)) : null,
                ]);
            }
        }
    }

    private function seedFeedbacks(array $teachers, array $students): void
    {
        $subjects = ['Data Structures', 'Machine Learning', 'Operating Systems', 'DBMS', 'Computer Networks', 'Calculus', 'Linear Algebra'];
        $positiveComments = [
            'Excellent teaching style with real-world examples. Highly recommended!',
            'Very knowledgeable and approachable. Classes are always engaging.',
            'One of the best professors I have had. Makes complex topics simple.',
            'Great at explaining concepts. Always available for doubt clearing.',
            'Inspiring teacher who motivates students to go beyond textbooks.',
        ];
        $negativeComments = [
            'Could improve the pace of teaching. Sometimes too fast to follow.',
            'More practical examples would be helpful in lectures.',
            'Needs to be more interactive with students during lectures.',
        ];

        foreach ($teachers as $teacher) {
            $numFeedbacks = rand(8, 15);
            $selectedStudents = array_slice($students, 0, $numFeedbacks);

            foreach ($selectedStudents as $student) {
                $quality = rand(3, 5);
                $communication = rand(3, 5);
                $knowledge = rand(4, 5);
                $interaction = rand(3, 5);
                $punctuality = rand(3, 5);
                $overall = ($quality + $communication + $knowledge + $interaction + $punctuality) / 5;

                $comment = $overall >= 4 ?
                    $positiveComments[array_rand($positiveComments)] :
                    $negativeComments[array_rand($negativeComments)];

                Feedback::create([
                    'teacher_id' => $teacher->id,
                    'student_id' => $student->id,
                    'subject' => $subjects[array_rand($subjects)],
                    'semester' => rand(1, 2),
                    'academic_year' => '2024-2025',
                    'ratings' => [
                        'teaching_quality' => $quality,
                        'communication' => $communication,
                        'subject_knowledge' => $knowledge,
                        'student_interaction' => $interaction,
                        'punctuality' => $punctuality,
                    ],
                    'overall_rating' => round($overall, 1),
                    'comment' => $comment,
                    'is_anonymous' => rand(0, 1) === 1,
                    'status' => 'reviewed',
                    'created_at' => Carbon::now()->subDays(rand(1, 90)),
                ]);
            }
        }
    }

    private function seedAttendance(array $teachers): void
    {
        foreach ($teachers as $teacher) {
            for ($month = 1; $month <= 10; $month++) {
                $totalDays = rand(22, 26);
                $daysPresent = rand(20, $totalDays);
                $daysAbsent = $totalDays - $daysPresent;
                $percentage = round(($daysPresent / $totalDays) * 100, 2);

                Attendance::create([
                    'teacher_id' => $teacher->id,
                    'month' => $month,
                    'year' => 2024,
                    'total_working_days' => $totalDays,
                    'days_present' => $daysPresent,
                    'days_absent' => $daysAbsent,
                    'leaves_taken' => rand(0, 2),
                    'attendance_percentage' => $percentage,
                ]);
            }
        }
    }

    private function seedWorkshopParticipants(array $teachers, array $workshops): void
    {
        foreach ($teachers as $teacher) {
            $completedWorkshops = array_filter($workshops, fn($w) => $w->status === 'completed');
            foreach ($completedWorkshops as $workshop) {
                if (rand(0, 1)) {
                    WorkshopParticipant::create([
                        'workshop_id' => $workshop->id,
                        'user_id' => $teacher->id,
                        'status' => 'completed',
                        'registered_at' => Carbon::parse($workshop->registration_deadline)->subDays(2),
                        'completed_at' => Carbon::parse($workshop->end_date),
                        'certificate_issued' => true,
                    ]);
                    $workshop->increment('current_participants');
                }
            }
        }
    }

    private function seedPerformanceScores(array $teachers): void
    {
        $grades = ['A+', 'A', 'B+', 'B', 'A+', 'A'];
        $badges = ['star_performer', 'excellence', 'rising_star', 'consistent', 'star_performer', 'excellence'];

        foreach ($teachers as $i => $teacher) {
            $overall = rand(72, 95);
            PerformanceScore::create([
                'teacher_id' => $teacher->id,
                'academic_year' => '2024-2025',
                'semester' => 1,
                'student_rating_score' => rand(70, 98),
                'attendance_score' => rand(75, 97),
                'achievement_score' => rand(60, 90),
                'workshop_score' => rand(60, 100),
                'feedback_sentiment_score' => rand(65, 95),
                'overall_score' => $overall,
                'grade' => $grades[$i] ?? 'B+',
                'badge' => $badges[$i] ?? 'consistent',
                'rank_in_department' => $i + 1,
                'calculated_at' => Carbon::now()->subDays(7),
            ]);
        }
    }

    private function seedAnnouncements(): void
    {
        $adminId = User::where('role', 'admin')->first()->id;

        $announcements = [
            [
                'title' => 'Faculty Development Program – Registration Open!',
                'content' => 'The annual Faculty Development Program for 2024-25 is now open for registration. All faculty members are encouraged to participate in at least 2 workshops this semester.',
                'type' => 'info',
                'target_role' => 'teacher',
            ],
            [
                'title' => 'Performance Assessment Q3 Results Published',
                'content' => 'The Q3 performance assessment results have been calculated and published. Faculty members can view their individual scores and feedback from the dashboard.',
                'type' => 'success',
                'target_role' => 'all',
            ],
            [
                'title' => 'Student Feedback Portal – Deadline Extended',
                'content' => 'The deadline for submitting faculty feedback for Semester 1 has been extended to December 20, 2024. Please ensure all students complete their feedback.',
                'type' => 'warning',
                'target_role' => 'student',
            ],
            [
                'title' => 'NAAC Accreditation Visit – Important Notice',
                'content' => 'NAAC peer team will be visiting the campus from January 15-17, 2025. All faculty are requested to ensure their portfolios and documentation are updated.',
                'type' => 'urgent',
                'target_role' => 'teacher',
            ],
        ];

        foreach ($announcements as $a) {
            Announcement::create([
                ...$a,
                'created_by' => $adminId,
                'is_active' => true,
                'created_at' => Carbon::now()->subDays(rand(1, 15)),
            ]);
        }
    }
}

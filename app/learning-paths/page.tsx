import { CheckCircle2, Clock, Users, Target, Zap, BookOpen, Code2, Rocket, Database, ArrowRight, Lock } from 'lucide-react';

export default function LearningPathsPage() {
    const learningPaths = [
        {
            id: 1,
            title: 'Frontend Developer',
            description: 'Master modern frontend development with HTML, CSS, JavaScript, React, and Next.js',
            duration: '24 weeks',
            level: 'Beginner to Advanced',
            students: 12500,
            difficulty: 'Intermediate',
            icon: Code2,
            color: 'from-blue-500/20 to-cyan-600/20',
            borderColor: 'border-blue-500/20',
            accentColor: 'text-blue-500',
            steps: [
                {
                    week: '1-2',
                    title: 'Web Fundamentals',
                    topics: ['Internet Basics', 'HTML5 Structure', 'CSS Fundamentals'],
                    duration: '12 hours',
                    tutorials: 15
                },
                {
                    week: '3-4',
                    title: 'CSS Mastery',
                    topics: ['Flexbox', 'Grid', 'Responsive Design', 'Animations'],
                    duration: '16 hours',
                    tutorials: 20
                },
                {
                    week: '5-8',
                    title: 'JavaScript Essentials',
                    topics: ['Variables & Types', 'Functions', 'DOM', 'Events', 'Async JS'],
                    duration: '32 hours',
                    tutorials: 40
                },
                {
                    week: '9-16',
                    title: 'React.js Mastery',
                    topics: ['Components', 'Hooks', 'State Management', 'Routing'],
                    duration: '40 hours',
                    tutorials: 50
                },
                {
                    week: '17-24',
                    title: 'Next.js & Deployment',
                    topics: ['Next.js Framework', 'API Routes', 'Deployment', 'Projects'],
                    duration: '32 hours',
                    tutorials: 40
                }
            ]
        },
        {
            id: 2,
            title: 'Full-Stack Developer',
            description: 'Complete path to become a full-stack developer. Build end-to-end applications.',
            duration: '32 weeks',
            level: 'Beginner to Advanced',
            students: 8900,
            difficulty: 'Advanced',
            icon: Rocket,
            color: 'from-purple-500/20 to-pink-600/20',
            borderColor: 'border-purple-500/20',
            accentColor: 'text-purple-500',
            steps: [
                {
                    week: '1-8',
                    title: 'Frontend Foundation',
                    topics: ['HTML', 'CSS', 'JavaScript', 'React Basics'],
                    duration: '32 hours',
                    tutorials: 40
                },
                {
                    week: '9-12',
                    title: 'Backend Basics',
                    topics: ['Node.js', 'Express.js', 'REST APIs'],
                    duration: '24 hours',
                    tutorials: 30
                },
                {
                    week: '13-18',
                    title: 'Database & Backend',
                    topics: ['MongoDB', 'PostgreSQL', 'Database Design', 'Authentication'],
                    duration: '30 hours',
                    tutorials: 35
                },
                {
                    week: '19-26',
                    title: 'Advanced Frontend & Backend',
                    topics: ['Advanced React', 'Next.js', 'Advanced Node.js', 'Microservices'],
                    duration: '40 hours',
                    tutorials: 45
                },
                {
                    week: '27-32',
                    title: 'Deployment & Projects',
                    topics: ['DevOps Basics', 'Docker', 'CI/CD', 'Full-Stack Projects'],
                    duration: '28 hours',
                    tutorials: 32
                }
            ]
        },
        {
            id: 3,
            title: 'React Specialist',
            description: 'Deep dive into React.js. Master components, state management, and performance.',
            duration: '16 weeks',
            level: 'Intermediate to Advanced',
            students: 6200,
            difficulty: 'Advanced',
            icon: Zap,
            color: 'from-cyan-500/20 to-blue-600/20',
            borderColor: 'border-cyan-500/20',
            accentColor: 'text-cyan-500',
            steps: [
                {
                    week: '1-2',
                    title: 'React Fundamentals',
                    topics: ['JSX', 'Components', 'Props', 'State'],
                    duration: '12 hours',
                    tutorials: 15
                },
                {
                    week: '3-6',
                    title: 'React Hooks',
                    topics: ['useState', 'useEffect', 'Custom Hooks', 'useContext'],
                    duration: '20 hours',
                    tutorials: 25
                },
                {
                    week: '7-10',
                    title: 'State Management',
                    topics: ['Redux', 'Zustand', 'Context API', 'Data Flow'],
                    duration: '24 hours',
                    tutorials: 30
                },
                {
                    week: '11-14',
                    title: 'Advanced React',
                    topics: ['Performance', 'Code Splitting', 'Error Boundaries', 'Testing'],
                    duration: '20 hours',
                    tutorials: 25
                },
                {
                    week: '15-16',
                    title: 'Real-World Projects',
                    topics: ['Complex Apps', 'Best Practices', 'Portfolio Projects'],
                    duration: '12 hours',
                    tutorials: 15
                }
            ]
        },
        {
            id: 4,
            title: 'JavaScript Mastery',
            description: 'Complete JavaScript path from fundamentals to advanced patterns and ES6+.',
            duration: '12 weeks',
            level: 'Beginner to Advanced',
            students: 10300,
            difficulty: 'Intermediate',
            icon: BookOpen,
            color: 'from-yellow-500/20 to-orange-600/20',
            borderColor: 'border-yellow-500/20',
            accentColor: 'text-yellow-500',
            steps: [
                {
                    week: '1-2',
                    title: 'JavaScript Basics',
                    topics: ['Variables', 'Data Types', 'Operators', 'Control Flow'],
                    duration: '12 hours',
                    tutorials: 15
                },
                {
                    week: '3-4',
                    title: 'Functions & Scope',
                    topics: ['Functions', 'Arrow Functions', 'Scope', 'Closures'],
                    duration: '14 hours',
                    tutorials: 18
                },
                {
                    week: '5-6',
                    title: 'Objects & Arrays',
                    topics: ['Objects', 'Arrays', 'Methods', 'Destructuring'],
                    duration: '14 hours',
                    tutorials: 18
                },
                {
                    week: '7-8',
                    title: 'Async JavaScript',
                    topics: ['Promises', 'Async/Await', 'Callbacks', 'Fetch API'],
                    duration: '16 hours',
                    tutorials: 20
                },
                {
                    week: '9-10',
                    title: 'DOM & Events',
                    topics: ['DOM Manipulation', 'Event Handling', 'Event Delegation'],
                    duration: '12 hours',
                    tutorials: 15
                },
                {
                    week: '11-12',
                    title: 'Advanced Patterns',
                    topics: ['Design Patterns', 'Performance', 'Best Practices'],
                    duration: '12 hours',
                    tutorials: 15
                }
            ]
        },
        {
            id: 5,
            title: 'Backend Developer',
            description: 'Build scalable backend systems with Node.js, Express, and databases.',
            duration: '20 weeks',
            level: 'Intermediate to Advanced',
            students: 5400,
            difficulty: 'Advanced',
            icon: Database,
            color: 'from-green-500/20 to-emerald-600/20',
            borderColor: 'border-green-500/20',
            accentColor: 'text-green-500',
            steps: [
                {
                    week: '1-2',
                    title: 'Node.js Fundamentals',
                    topics: ['Node.js Basics', 'NPM', 'Modules', 'File System'],
                    duration: '12 hours',
                    tutorials: 15
                },
                {
                    week: '3-6',
                    title: 'Express.js',
                    topics: ['Express Basics', 'Routing', 'Middleware', 'Error Handling'],
                    duration: '20 hours',
                    tutorials: 25
                },
                {
                    week: '7-12',
                    title: 'Databases',
                    topics: ['MongoDB', 'PostgreSQL', 'Queries', 'Schema Design'],
                    duration: '30 hours',
                    tutorials: 35
                },
                {
                    week: '13-16',
                    title: 'Advanced Backend',
                    topics: ['Authentication', 'Authorization', 'API Design', 'Scalability'],
                    duration: '24 hours',
                    tutorials: 30
                },
                {
                    week: '17-20',
                    title: 'DevOps & Deployment',
                    topics: ['Docker', 'Deployment', 'Monitoring', 'Performance'],
                    duration: '20 hours',
                    tutorials: 25
                }
            ]
        },
        {
            id: 6,
            title: 'Web Basics',
            description: 'Start your web development journey. Perfect for absolute beginners.',
            duration: '8 weeks',
            level: 'Beginner',
            students: 15800,
            difficulty: 'Beginner',
            icon: Rocket,
            color: 'from-indigo-500/20 to-purple-600/20',
            borderColor: 'border-indigo-500/20',
            accentColor: 'text-indigo-500',
            steps: [
                {
                    week: '1',
                    title: 'Internet & Web',
                    topics: ['How Internet Works', 'Web Standards', 'Browsers'],
                    duration: '6 hours',
                    tutorials: 8
                },
                {
                    week: '2-3',
                    title: 'HTML Essentials',
                    topics: ['HTML Tags', 'Forms', 'Semantic HTML'],
                    duration: '12 hours',
                    tutorials: 15
                },
                {
                    week: '4-5',
                    title: 'CSS Styling',
                    topics: ['CSS Basics', 'Selectors', 'Box Model', 'Flexbox'],
                    duration: '14 hours',
                    tutorials: 18
                },
                {
                    week: '6-8',
                    title: 'JavaScript Intro',
                    topics: ['JS Basics', 'DOM', 'Events', 'Simple Projects'],
                    duration: '16 hours',
                    tutorials: 20
                }
            ]
        }
    ];

    return (
        <main className="min-h-screen bg-gradient-to-b from-background via-background to-card/30">
            {/* Hero Section */}
            <section className="px-4 sm:px-6 lg:px-8 py-20">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-12">
                        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground mb-6">
                            Learning <span className="text-primary">Paths</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            Structured learning journeys designed to take you from beginner to expert. Choose your path and start learning today.
                        </p>
                    </div>

                    {/* Filter/Info Section */}
                    <div className="bg-card border border-border rounded-xl p-8 mb-12">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="flex items-start gap-4">
                                <Target className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Self-Paced Learning</h3>
                                    <p className="text-muted-foreground text-sm">Learn at your own speed. No deadlines, just progress.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <CheckCircle2 className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Structured Curriculum</h3>
                                    <p className="text-muted-foreground text-sm">Build skills progressively with proven learning paths.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Zap className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Hands-On Projects</h3>
                                    <p className="text-muted-foreground text-sm">Apply what you learn with real-world projects.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Learning Paths Grid */}
            <section className="px-4 sm:px-6 lg:px-8 pb-20">
                <div className="mx-auto max-w-6xl">
                    <div className="space-y-12">
                        {learningPaths.map((path) => {
                            const Icon = path.icon;
                            return (
                                <div key={path.id} className={`bg-gradient-to-br ${path.color} border ${path.borderColor} rounded-2xl overflow-hidden`}>
                                    {/* Path Header */}
                                    <div className="bg-card/50 backdrop-blur border-b border-border p-8">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                                            <div className="lg:col-span-2">
                                                <div className="flex items-start gap-4 mb-4">
                                                    <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0`}>
                                                        <Icon className={`w-6 h-6 ${path.accentColor}`} />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-3xl font-bold text-foreground mb-2">{path.title}</h2>
                                                        <p className="text-muted-foreground">{path.description}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CTA Button */}
                                            <div className="flex flex-col gap-3">
                                                <button className={`w-full py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors bg-primary text-primary-foreground hover:bg-primary/90`}>
                                                    Start Path <ArrowRight size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1">Duration</div>
                                                <div className="flex items-center gap-2 text-foreground font-semibold">
                                                    <Clock size={16} /> {path.duration}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1">Level</div>
                                                <div className="text-foreground font-semibold">{path.level}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1">Difficulty</div>
                                                <div className={`font-semibold ${
                                                    path.difficulty === 'Beginner' ? 'text-green-500' :
                                                    path.difficulty === 'Intermediate' ? 'text-yellow-500' :
                                                    'text-red-500'
                                                }`}>
                                                    {path.difficulty}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1">Learners</div>
                                                <div className="flex items-center gap-2 text-foreground font-semibold">
                                                    <Users size={16} /> {(path.students / 1000).toFixed(1)}k
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Path Steps */}
                                    <div className="p-8">
                                        <h3 className="text-lg font-bold text-foreground mb-6">Learning Roadmap</h3>
                                        <div className="space-y-4">
                                            {path.steps.map((step, idx) => (
                                                <div key={idx} className="relative">
                                                    {/* Timeline connector */}
                                                    {idx < path.steps.length - 1 && (
                                                        <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-primary/20" />
                                                    )}

                                                    <div className="flex gap-6">
                                                        {/* Timeline dot */}
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm ${
                                                                idx === 0 ? 'bg-primary text-primary-foreground' : 'bg-card border-2 border-primary/20 text-foreground'
                                                            }`}>
                                                                {idx + 1}
                                                            </div>
                                                        </div>

                                                        {/* Step Content */}
                                                        <div className="flex-1 pb-6">
                                                            <div className="bg-background/50 border border-border rounded-lg p-5">
                                                                <div className="flex items-start justify-between mb-3">
                                                                    <div>
                                                                        <h4 className="font-bold text-foreground text-lg mb-1">{step.title}</h4>
                                                                        <p className="text-xs text-muted-foreground">Week {step.week}</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="text-xs font-semibold text-primary mb-1">{step.tutorials} tutorials</div>
                                                                        <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                                                                            <Clock size={12} /> {step.duration}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {step.topics.map((topic, topicIdx) => (
                                                                        <span key={topicIdx} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                                                                            {topic}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="px-4 sm:px-6 lg:px-8 py-16 bg-card/50">
                <div className="mx-auto max-w-6xl">
                    <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Frequently Asked Questions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-background border border-border rounded-lg p-6">
                            <h3 className="font-bold text-foreground mb-2">How long does each path take?</h3>
                            <p className="text-muted-foreground text-sm">Duration varies from 8 to 32 weeks depending on the path. These are estimates for learning 4-5 hours per week.</p>
                        </div>
                        <div className="bg-background border border-border rounded-lg p-6">
                            <h3 className="font-bold text-foreground mb-2">Can I switch between paths?</h3>
                            <p className="text-muted-foreground text-sm">Yes! You can start one path and switch to another. Your progress is saved and you can resume anytime.</p>
                        </div>
                        <div className="bg-background border border-border rounded-lg p-6">
                            <h3 className="font-bold text-foreground mb-2">Do I need prior experience?</h3>
                            <p className="text-muted-foreground text-sm">The Web Basics path is perfect for absolute beginners. Other paths assume basic web knowledge.</p>
                        </div>
                        <div className="bg-background border border-border rounded-lg p-6">
                            <h3 className="font-bold text-foreground mb-2">Is there a certificate?</h3>
                            <p className="text-muted-foreground text-sm">Yes! Complete a path and earn a certificate you can add to your portfolio.</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

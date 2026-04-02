import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
            {/* Navigation Bar */}
            <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary p-1.5 rounded-lg text-white">
                                <span className="material-symbols-outlined text-2xl">shield_lock</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-primary">OEP</span>
                        </div>

                        

                        <div className="flex items-center gap-3">
                            <Link to="/login" className="px-4 py-2 text-sm font-semibold hover:text-primary transition-colors">Login</Link>
                            <Link to="/register?role=INSTRUCTOR" className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">Instructor Mode</Link>
                        </div>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="relative overflow-hidden py-20 lg:py-32 bg-white dark:bg-background-dark">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-6">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                NEW: AI-POWERED PROCTORING V2.0
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-6">
                                Empowering <span className="text-primary">Academic Integrity</span> in a Digital World
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg leading-relaxed">
                                Experience the future of assessment with AI-driven proctoring, real-time behavioral analytics, and enterprise-grade security for global institutions.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/register" className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-primary/30 hover:scale-105 transition-transform inline-block">Get Started</Link>
                                <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-200 transition-colors">
                                    <span className="material-symbols-outlined">play_circle</span>
                                    Watch How it Works
                                </button>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
                            <div className="relative rounded-2xl overflow-hidden border border-primary/10 shadow-2xl bg-slate-900 aspect-video group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-transparent mix-blend-overlay"></div>
                                <img
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVnWyJCny5QDMZhMjJEus47V0qKYkzFLBh6fevuHgbwABKKCFtHWA6RNWdc3ww4w3NwlqCdcSQYiVBOORolsTMcmfGvxDk7w0UVHUyhxTpYE5qUFdmVopHcAmxPrvNuxcOcpKNRoVTI9wMHHFE154ZGFTGlBTavXXpe05wQtH3ASAhrGcc5HDvRuNLHqLvPDamVmDh8rbU3MG8hJH5SLgIc5dwddpmh4Ufozc9sPdZbMWFRrOIloKWyg9awgsw6inpZZ3k_YARf6s_"
                                    alt="Digital Security Illustration"
                                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute bottom-6 left-6 right-6 p-4 glass-card rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-600">
                                            <span className="material-symbols-outlined">verified_user</span>
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-primary uppercase">Live Monitoring</div>
                                            <div className="text-sm font-medium">99.9% Detection Accuracy Active</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Three Pillars Feature Grid */}
                <section className="py-24 bg-background-light dark:bg-slate-900/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4">Our Core Pillars</h2>
                            <p className="text-slate-600 dark:text-slate-400">Built for scale, security, and seamless integration.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl border border-primary/5 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group">
                                <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-3xl">shield_person</span>
                                </div>
                                <h3 className="text-xl font-bold mb-3">Uncompromising Security</h3>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Total session control, randomized sequencing, and hardened browser lockdown to prevent external aid.</p>
                            </div>

                            <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl border border-primary/5 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group">
                                <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-3xl">edit_document</span>
                                </div>
                                <h3 className="text-xl font-bold mb-3">Versatile Assessment</h3>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Native support for complex MCQs, real-time Coding environments, and AI-assisted Descriptive formats.</p>
                            </div>

                            <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl border border-primary/5 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group">
                                <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-3xl">psychology</span>
                                </div>
                                <h3 className="text-xl font-bold mb-3">Automated Intelligence</h3>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Instant real-time auto-grading and deep behavioral analytics to identify patterns across institutional data.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Role-Based Access Section */}
                <section className="py-24 bg-white dark:bg-background-dark">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                            <div className="max-w-2xl">
                                <h2 className="text-4xl font-black mb-4">Tailored for Every Role</h2>
                                <p className="text-slate-600 dark:text-slate-400">A unified platform with specialized interfaces designed for the unique needs of every stakeholder.</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Student Card */}
                            <div className="flex flex-col rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm bg-background-light dark:bg-slate-900 group">
                                <div className="h-48 relative overflow-hidden">
                                    <img
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCe-WcJgd5GClZ7Guzh91KhDotK1QRaZJkSbSDgyOqmchqUM3igycnR0KXl-BZYwrEIIfZpvodC572dM95DQWQ6GVqrc84WR5cTZLsWbAN_LLpC_5jjYcBNDVyXEyQ0OZ7q9IkupH-yUp9Yfu6RPdLxu3rSW-NFfhuH0iHga4fkiu97ZNoBDM36VOQFDuzk045EcNlxMsTF_zqUYni6en4cjUmwmYbDrJU_vT4-qE9QQBE6Az0yIrEE1fdqmnV3YVMyB19SBziQb1q2"
                                        alt="Student Portal"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-primary/20"></div>
                                </div>
                                <div className="p-8">
                                    <h3 className="text-2xl font-bold mb-3">Student Portal</h3>
                                    <ul className="space-y-3 mb-6">
                                        <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                                            Adaptive session timers
                                        </li>
                                        <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                                            Secure exam sandbox
                                        </li>
                                        <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                                            Instant performance feedback
                                        </li>
                                    </ul>
                                    <button className="text-primary font-bold flex items-center gap-1 group-hover:gap-2 transition-all">Explore Portal <span className="material-symbols-outlined">arrow_forward</span></button>
                                </div>
                            </div>

                            {/* Instructor Card */}
                            <div className="flex flex-col rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm bg-background-light dark:bg-slate-900 group">
                                <div className="h-48 relative overflow-hidden">
                                    <img
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnU7tQS56QR9huBIcJrVy0p-bq_oUiFvIMfZkJEvtUDtbShGZNC84FFtXYvMWiwqZ_vHK89HXv7MjxBfJJXijiDvpzUOcXD_4Bm4BY5jPKr4pdMcwwx0gHyaDhRoyTB5JfflvsrO7_9Y7_ihMmW14hbNu2m2fOmx4A-Lw15PZjrKT89Q1lnYsOOWdRKfwJz_cNwrd2I5zW6Zpwrra-BH1Wvk9wbXiAc3jpdUlcUvqJ-GeZ7NjTxl8TrkG42qDI6_zYmg90MHomsS-1"
                                        alt="Instructor Dashboard"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-primary/20"></div>
                                </div>
                                <div className="p-8">
                                    <h3 className="text-2xl font-bold mb-3">Instructor Dashboard</h3>
                                    <ul className="space-y-3 mb-6">
                                        <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                                            Batch scheduling tools
                                        </li>
                                        <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                                            Advanced grading workspace
                                        </li>
                                        <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                                            Video proctoring logs
                                        </li>
                                    </ul>
                                    <button className="text-primary font-bold flex items-center gap-1 group-hover:gap-2 transition-all">View Dashboard <span className="material-symbols-outlined">arrow_forward</span></button>
                                </div>
                            </div>

                            {/* Admin Card */}
                            <div className="flex flex-col rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm bg-background-light dark:bg-slate-900 group">
                                <div className="h-48 relative overflow-hidden">
                                    <img
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMaXKRLf_NsCTJmzvhlyiS08jHGg7--tP2hbe3cAIbEz4dIqgRVRLOcXhNwk999ULXruZMStyMygVInwUu4PfUvyDtApxIwRE0eMpcW1JTwLIyVbREu4MiSM5kWHqhKQotHGMJQxAuHsy62GaxKz-HTB7vObHCQ6ipPuzGnli7birwE3znip-DCZ2AZcvfAhrOu3fBD__pbkPem4Hx9yM57WmntDKVoeTpdgzP4Y09B1_tYmKJPOQbYNYe9S_Temij0j89--agpasG"
                                        alt="Admin Console"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-primary/20"></div>
                                </div>
                                <div className="p-8">
                                    <h3 className="text-2xl font-bold mb-3">Admin Console</h3>
                                    <ul className="space-y-3 mb-6">
                                        <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                                            RBAC & Team management
                                        </li>
                                        <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                                            Institutional audit trails
                                        </li>
                                        <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                                            Global system oversight
                                        </li>
                                    </ul>
                                    <button className="text-primary font-bold flex items-center gap-1 group-hover:gap-2 transition-all">Access Console <span className="material-symbols-outlined">arrow_forward</span></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Data & Analytics Preview */}
                <section className="py-24 bg-primary text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-4xl font-black mb-6">Actionable Insights & Behavioral Analytics</h2>
                                <p className="text-white/80 text-lg mb-8 leading-relaxed">
                                    Don't just deliver exams; understand them. Our analytics engine tracks everything from question difficulty curves to individual student stress levels based on behavioral markers.
                                </p>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4 p-6 bg-white/10 rounded-2xl border border-white/10">
                                        <span className="material-symbols-outlined text-3xl">analytics</span>
                                        <div>
                                            <h4 className="font-bold text-xl mb-1">Pass/Fail Intelligence</h4>
                                            <p className="text-white/70">Real-time cohort performance monitoring with standard deviation analysis.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-6 bg-white/10 rounded-2xl border border-white/10">
                                        <span className="material-symbols-outlined text-3xl">bar_chart</span>
                                        <div>
                                            <h4 className="font-bold text-xl mb-1">Question Difficulty Mapping</h4>
                                            <p className="text-white/70">Identify outlier questions and calibrate your assessments for perfect balance.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                {/* Mock Dashboard Element */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 text-slate-900 dark:text-slate-100">
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 className="font-bold text-lg">Exam Analytics Summary</h3>
                                        <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">LIVE DATA</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 mb-8">
                                        <div className="p-4 bg-background-light dark:bg-slate-800 rounded-xl">
                                            <div className="text-slate-500 text-xs mb-1">Average Score</div>
                                            <div className="text-2xl font-black text-primary">84.2%</div>
                                            <div className="text-[10px] text-green-500 font-bold">↑ 4.2% vs last term</div>
                                        </div>
                                        <div className="p-4 bg-background-light dark:bg-slate-800 rounded-xl">
                                            <div className="text-slate-500 text-xs mb-1">Completion Rate</div>
                                            <div className="text-2xl font-black text-primary">98.5%</div>
                                            <div className="text-[10px] text-slate-400 font-bold">Target: 95.0%</div>
                                        </div>
                                    </div>

                                    {/* Mock Charts */}
                                    <div className="space-y-4">
                                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Question Difficulty (Top 5)</div>
                                        <div className="space-y-3">
                                            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary w-[90%]"></div>
                                            </div>
                                            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary w-[75%]"></div>
                                            </div>
                                            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary/40 w-[45%]"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-24 bg-background-light dark:bg-background-dark">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <h2 className="text-4xl font-black mb-8">Ready to secure your institution's future?</h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register?role=INSTRUCTOR" className="bg-primary text-white px-10 py-4 rounded-xl font-bold text-lg shadow-xl shadow-primary/30 hover:scale-105 transition-transform inline-block">Instructor Mode</Link>
                            <button className="bg-white dark:bg-slate-800 border border-primary/20 px-10 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-colors">Contact Sales</button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-white py-16 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="bg-primary p-1.5 rounded-lg text-white">
                                    <span className="material-symbols-outlined text-2xl">shield_lock</span>
                                </div>
                                <span className="text-xl font-bold tracking-tight">OEP</span>
                            </div>
                            <p className="text-slate-400 max-w-sm mb-6 leading-relaxed">
                                Setting the global standard for academic integrity through advanced AI monitoring and secure assessment technology.
                            </p>
                            <div className="flex items-center gap-4 grayscale opacity-50">
                                <img
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuARevM8Kd-WV1GtczoGn6Y4cGYJcGS4GPCyJBD-nmf6OctYjVQkcB6yhAjGxQ7VHJJrBOHIDWIBCBuNI7pC4AqcSADiGRENa81uH6s6X_f-goic8dGlQPv5z7uSLOC1wQiL4knBFRWYaVqadF1Hvoqr8ERRLdQSwZr8X2ioh74yBTbEyYcFaYg9ttfTfXOi5hGHvqfDv5ClTGJh0oy1fzPgRuF2C-xLjAtrK2t-FRiIlLpSzPXDi8MwbQAoZazxbkWhZWiMWBt5GxOl"
                                    alt="Tech Stack Django"
                                />
                                <img
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXR-Xez60HQvPr_I1B9oSm-CoUIL2m611AZTZTdo_qUbGNp7HVSGVrLbNFFllqYoJYGXHBnILh3tWfi8KffxvoL08NvUBP7YmyXj6eJf4MO3RAdb5nycevkOozO8Mb0SjWedhiSOqh0scWh7nBWlLgNfDxCf1KAAFy_muyaMRqkufOe6KrAySWeBNrbzkfrLkU6gQNtKBaAXvKtv9VEphuAyLSqdEnJ_shebNj2yGboDWRm-06Mz8wrAiUeoNRXt2dTrIYmVbyI47-"
                                    alt="Tech Stack PostgreSQL"
                                />
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-lg mb-6">Resources</h4>
                            <ul className="space-y-4 text-slate-400">
                                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">API Reference</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-lg mb-6">Company</h4>
                            <ul className="space-y-4 text-slate-400">
                                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
                        <p>© 2024 OEP Systems Inc. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-white transition-colors">Twitter</a>
                            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                            <a href="#" className="hover:text-white transition-colors">GitHub</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

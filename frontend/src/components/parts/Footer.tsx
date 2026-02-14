import Container from "../ui/container";
import Logo from "../ui/logo";


const Footer = () => {
    return (
        <footer className="w-full bg-black/80 backdrop-blur-md border-t border-white/10 text-white/80">
            <Container className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">

                <div className="flex items-start col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-1">
                <Logo />
                </div>

                <div className="flex flex-col gap-3 sm:gap-6">
                    <h2 className="text-xs sm:text-sm font-semibold text-white">Features</h2>
                    <div className="flex flex-col gap-2 text-xs sm:text-sm">
                        <a href="/create" className="text-gray-700 hover:text-gray-50">Create Mimi</a>
                        <a href="/create-ai" className="text-gray-700 hover:text-gray-50">Create AI Mimi</a>
                        <a href="/feed" className="text-gray-700 hover:text-gray-50">Feed</a>
                        <a href="/templates" className="text-gray-700 hover:text-gray-50">Templates</a>
                        <a href="/rats" className="text-gray-700 hover:text-gray-50">Rats</a>
                        <a href="/upload-templates" className="text-gray-700 hover:text-gray-50">Upload Templates</a>
                        <a href="/mobile" className="text-gray-700 hover:text-gray-50">Mobile</a>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:gap-6">
                    <h2 className="text-xs sm:text-sm font-semibold text-white">Product</h2>
                    <div className="flex flex-col gap-2 text-xs sm:text-sm">
                        <a href="/pricing" className="text-gray-700 hover:text-gray-50">Pricing</a>
                        <a href="/method" className="text-gray-700 hover:text-gray-50">Method</a>
                        <a href="/integration" className="text-gray-700 hover:text-gray-50">Integrations</a>
                        <a href="/changelog" className="text-gray-700 hover:text-gray-50">Changelog</a>
                        <a href="/documentation" className="text-gray-700 hover:text-gray-50">Documentation</a>
                        <a href="/download" className="text-gray-700 hover:text-gray-50">Download</a>
                        <a href="/switch" className="text-gray-700 hover:text-gray-50">Switch</a>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:gap-6">
                    <h2 className="text-xs sm:text-sm font-semibold text-white">Company</h2>
                    <div className="flex flex-col gap-2 text-xs sm:text-sm">
                        <a href="/about" className="text-gray-700 hover:text-gray-50">About</a>
                        <a href="/customers" className="text-gray-700 hover:text-gray-50">Customers</a>
                        <a href="/careers" className="text-gray-700 hover:text-gray-50">Careers</a>
                        <a href="/now" className="text-gray-700 hover:text-gray-50">Now</a>
                        <a href="/readme" className="text-gray-700 hover:text-gray-50">README</a>
                        <a href="/quality" className="text-gray-700 hover:text-gray-50">Quality</a>
                        <a href="/brand" className="text-gray-700 hover:text-gray-50">Brand</a>
                    </div>
                </div>


                <div className="flex flex-col gap-3 sm:gap-6">
                    <h2 className="text-xs sm:text-sm font-semibold text-white">Resources</h2>
                    <div className="flex flex-col gap-2 text-xs sm:text-sm">
                        <a href="/developers" className="text-gray-700 hover:text-gray-50">Developer</a>
                        <a href="/status" className="text-gray-700 hover:text-gray-50">Status</a>
                        <a href="/startups" className="text-gray-700 hover:text-gray-50">Startups</a>
                        <a href="/reports" className="text-gray-700 hover:text-gray-50">Reports</a>
                        <a href="/dpa" className="text-gray-700 hover:text-gray-50">DPA</a>
                        <a href="/privacy" className="text-gray-700 hover:text-gray-50">Privacy</a>
                        <a href="/terms" className="text-gray-700 hover:text-gray-50">Terms</a>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:gap-6">
                    <h2 className="text-xs sm:text-sm font-semibold text-white">Connect</h2>
                    <div className="flex flex-col gap-2 text-xs sm:text-sm">
                        <a href="https://kneerazzz.vercel.app" className="text-gray-700 hover:text-gray-50">Contact us</a>
                        <a href="https://instagram.com/kneerazzz" className="text-gray-700 hover:text-gray-50">Community</a>
                        <a href="https://x.com/kneerazzz" className="text-gray-700 hover:text-gray-50">X (Twitter)</a>
                        <a href="https://github.com/kneerazzz" className="text-gray-700 hover:text-gray-50">Github</a>
                        <a href="https://instagram.com/kneerazzz" className="text-gray-700 hover:text-gray-50">Instagram</a>
                        <a href="https://linkedin.com/in/kneerazzz" className="text-gray-700 hover:text-gray-50">Linkedin</a>
                    </div>
                </div>


            </Container>

            {/* BOTTOM: Copyright */}
            <div className="text-center text-xs sm:text-sm text-white/40 pb-4 sm:pb-6">
                © {new Date().getFullYear()} SkillSprint. All rights reserved.
            </div>
        </footer>

    )
}

export default Footer;
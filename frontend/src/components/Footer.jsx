import { Github, Linkedin, Mail, ExternalLink , TrendingUp} from "lucide-react"



export default function Footer() {

    return (
      
        <footer className="bg-white  text-gray-800 py-6 shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                {/* Left Section */}
                <div className="mb-4 md:mb-0 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start space-x-2">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                    <span className="text-2xl font-semibold text-gray-900">EquityTrack</span>
                    </div>
                    <p className="text-gray-600 mt-2">Track your investments and equity holdings efficiently.</p>
                </div>

                {/* Right Section */}
                <div className="flex flex-wrap justify-center md:justify-end gap-4">
                    <a
                    href="https://www.linkedin.com/in/revanasidda-karigoudar-726a35218/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition duration-200"
                    >
                    <Linkedin className="h-6 w-6" />
                    <span>LinkedIn</span>
                    </a>

                    <a
                    href="https://github.com/RevanasiddaNK/EquityTrack"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition duration-200"
                    >
                    <Github className="h-6 w-6" />
                    <span>GitHub</span>
                    </a>

                    <a
                    href="mailto:nmrevanasiddarhbk@gmail.com"
                    className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition duration-200"
                    aria-label="Send an email to nmrevanasiddarhbk@gmail.com"
                    >
                    <Mail className="h-6 w-6" />
                    <span>Email</span>
                    </a>

                    <a
                    href="https://github.com/RevanasiddaNK/EquityTrack"
                    className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition duration-200"
                    >
                    <ExternalLink className="h-6 w-6" />
                    <span>Documentation</span>
                    </a>
                </div>
                </div>

                {/* Footer Bottom */}
                <div className="mt-4 mb-4 text-center text-gray-500 text-sm">
                © {new Date().getFullYear()} EquityTrack. All rights reserved.
                </div>
            </div>
        </footer>

    );
}




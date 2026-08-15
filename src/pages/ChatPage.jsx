import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Send,
  Paperclip,
  Code,
  Database,
  UploadCloud,
  X,
  Loader2,
  FileCode,
  Menu,
  Github,
  HelpCircle,
  Info,
  Sparkles,
  ChevronRight,
  LogOut,
  Wand2,
  Copy,
  Check,
  Bot,
  Cpu,
  Terminal,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createProject, getProjectStatus, chatWithProject } from "../lib/api";
import {
  DEMO_PROJECT,
  DEMO_PROJECT_ID,
  DEMO_ANALYSIS_REPORT,
  getDemoChatResponse,
  parseAnalysisReport,
} from "../data/demoProject";

const MultiSelectSearch = ({ label, placeholder, options, selected, onChange }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = query === ""
    ? options.filter(opt => !selected.includes(opt))
    : options.filter(opt => opt.toLowerCase().includes(query.toLowerCase()) && !selected.includes(opt));

  return (
    <div className="relative">
      <label className="block text-xs font-mono uppercase text-subtle mb-1.5">
        {label}
      </label>
      <div
        className="w-full flex flex-wrap gap-2 p-2 border border-zinc-200 rounded-lg bg-white focus-within:border-obsidian transition-colors min-h-10.5"
      >
        {selected.map(item => (
          <span key={item} className="px-2 py-1 bg-zinc-100/80 text-obsidian text-xs rounded border border-zinc-200 font-mono flex items-center gap-1.5">
            {item}
            <button type="button" onClick={() => onChange(selected.filter(i => i !== item))} className="text-zinc-400 hover:text-brand-red transition-colors">
              <X size={12} strokeWidth={3} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          placeholder={selected.length === 0 ? placeholder : ""}
          className="flex-1 bg-transparent text-sm focus:outline-none min-w-30 pb-1 pt-1 font-body text-obsidian"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim()) {
              e.preventDefault();
              if (!selected.includes(query.trim())) {
                onChange([...selected, query.trim()]);
              }
              setQuery("");
            }
          }}
        />
      </div>
      {isOpen && (filteredOptions.length > 0 || query.trim()) && (
        <div
          className="absolute z-20 w-full mt-1 bg-white border border-zinc-200 shadow-xl rounded-lg max-h-48 overflow-y-auto p-1"
          onMouseDown={(e) => e.preventDefault()}
        >
          {filteredOptions.length > 0 ? filteredOptions.map(opt => (
            <button
              key={opt}
              type="button"
              className="w-full text-left px-3 py-2 text-sm text-obsidian rounded hover:bg-zinc-50 transition-colors font-body"
              onClick={() => {
                onChange([...selected, opt]);
                setQuery("");
                setIsOpen(false);
              }}
            >
              {opt}
            </button>
          )) : query.trim() ? (
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-sm text-brand-emerald rounded hover:bg-zinc-50 transition-colors font-body flex gap-2 items-center"
              onClick={() => {
                if (!selected.includes(query.trim())) {
                  onChange([...selected, query.trim()]);
                }
                setQuery("");
                setIsOpen(false);
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald"></div>
              Add custom: <span className="font-bold">"{query}"</span>
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
};

const TypewriterMarkdown = ({ content, onComplete, speed = 8 }) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedContent((prev) => prev + content[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, content, speed, onComplete]);

  // Append a backtick string if code blocks are left open to avoid breaking Markdown formatting during animation
  const openBlocks = (displayedContent.match(/```/g) || []).length;
  const safeContent = openBlocks % 2 !== 0 ? `${displayedContent}\\n\`\`\`` : displayedContent;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ inline, children, className, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <div className="bg-zinc-900 text-zinc-100 p-2 rounded-md my-2 overflow-x-auto text-xs font-mono">
              <code className={className} {...props}>
                {children}
              </code>
            </div>
          ) : (
            <code
              className="bg-zinc-100 px-1 py-0.5 rounded font-mono text-xs text-obsidian"
              {...props}
            >
              {children}
            </code>
          );
        },
        table({ children, ...props }) {
          return (
            <div className="overflow-x-auto my-4 border border-zinc-200 rounded-lg">
              <table className="min-w-full divide-y divide-zinc-200 text-sm table-auto" {...props}>
                {children}
              </table>
            </div>
          );
        },
        th({ children, ...props }) {
          return <th className="px-4 py-3 bg-zinc-50 font-semibold text-left text-obsidian border-b border-zinc-200" {...props}>{children}</th>;
        },
        td({ children, ...props }) {
          return <td className="px-4 py-3 border-b border-zinc-100/50 align-top" {...props}>{children}</td>;
        },
      }}
    >
      {safeContent}
    </ReactMarkdown>
  );
};

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingMsgId, setTypingMsgId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDemoMode = searchParams.get("demo") === "true";
  const projectParam = searchParams.get("project");

  const [showUploadModal, setShowUploadModal] = useState(
    Boolean(location.state?.showUploadModal && !isDemoMode && !projectParam)
  );
  const [showSidebar, setShowSidebar] = useState(false);
  const [projectId, setProjectId] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [showManual, setShowManual] = useState(false);
  const [showToken, setShowToken] = useState(false);

  // Setup Wizard State
  const [setupStep, setSetupStep] = useState(1);
  const [sourceType, setSourceType] = useState("zip");
  const [projectData, setProjectData] = useState({
    name: "",
    type: "",
    language: [],
    file: null,
    githubUrl: "",
    githubToken: "",
  });

  // Prompt Feature States
  const [promptModalData, setPromptModalData] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState("Software Architect");
  const [selectedIde, setSelectedIde] = useState("VS Code Copilot");
  const [promptContext, setPromptContext] = useState("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const PERSONA_OPTIONS = [
    "Software Architect",
    "Security Specialist",
    "Performance Engineer",
    "SDE-2",
    "Frontend Expert",
    "Backend Expert"
  ];

  const IDE_OPTIONS = [
    "VS Code Copilot",
    "Cursor",
    "Claude",
    "Antigravity",
    "Codex"
  ];

  const generateTailoredPrompt = () => {
    let personaInstruction = "";
    switch (selectedPersona) {
      case "Software Architect":
        personaInstruction = "Role: Principal Software Architect.\nObjective: Implement robust, scalable, and clean code solutions. Follow SOLID principles and optimal design patterns.";
        break;
      case "Security Specialist":
        personaInstruction = "Role: Senior Application Security Engineer.\nObjective: Ensure strict adherence to OWASP guidelines. Prioritize vulnerability prevention and secure coding practices.";
        break;
      case "Performance Engineer":
        personaInstruction = "Role: Performance Engineering Specialist.\nObjective: Optimize for minimal latency, reduced time complexity, and efficient memory usage.";
        break;
      case "SDE-2":
        personaInstruction = "Role: Senior Software Engineer (SDE-2).\nObjective: Produce production-ready, highly maintainable, and well-tested code.";
        break;
      case "Frontend Expert":
        personaInstruction = "Role: Frontend Architecture Expert.\nObjective: Focus on responsive design, WCAG accessibility, and modern React best practices.";
        break;
      case "Backend Expert":
        personaInstruction = "Role: Backend Systems Expert.\nObjective: Ensure database query efficiency, RESTful API standards, and comprehensive error handling.";
        break;
      default:
        personaInstruction = `Role: Expert ${selectedPersona}.`;
    }

    let finalPrompt = "";
    const baseTemplate = `${personaInstruction}\n\nContext:\n${promptContext}\n\nTask:\nPlease analyze the provided context and implement the necessary code changes to fully resolve the issue. Provide only the updated code blocks or files, ensuring the solution is complete, tested, and optimized for performance. Focus strictly on answering the prompt with zero fluff.`;

    if (selectedIde === "VS Code Copilot") {
      finalPrompt = `@workspace\n${baseTemplate}`;
    } else if (selectedIde === "Cursor") {
      finalPrompt = `[Use Edit Mode]\n${baseTemplate}`;
    } else {
      finalPrompt = baseTemplate;
    }

    return finalPrompt;
  };

  const handleOpenPromptModal = (content) => {
    setPromptContext(content);

    // Auto-detect persona
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('security') || lowerContent.includes('vulnerability') || lowerContent.includes('owasp')) {
      setSelectedPersona('Security Specialist');
    } else if (lowerContent.includes('performance') || lowerContent.includes('slow') || lowerContent.includes('optimize')) {
      setSelectedPersona('Performance Engineer');
    } else if (lowerContent.includes('frontend') || lowerContent.includes('react') || lowerContent.includes('ui/ux')) {
      setSelectedPersona('Frontend Expert');
    } else if (lowerContent.includes('backend') || lowerContent.includes('database') || lowerContent.includes('api')) {
      setSelectedPersona('Backend Expert');
    } else if (lowerContent.includes('test') || lowerContent.includes('jest') || lowerContent.includes('coverage')) {
      setSelectedPersona('SDE-2');
    } else {
      setSelectedPersona('Software Architect');
    }

    setPromptModalData(true);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generateTailoredPrompt());
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const messagesEndRef = useRef(null);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('user');
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadCompletedProject = (pid, reportText, projectMeta = {}) => {
    const { report, suggestions } = parseAnalysisReport(reportText);
    const firstMsgId = "report-" + Date.now();
    setProjectId(pid);
    setProjectData((prev) => ({
      ...prev,
      githubUrl: projectMeta.repoUrl || DEMO_PROJECT.repoUrl,
    }));
    setShowUploadModal(false);
    setTypingMsgId(firstMsgId);
    setMessages([
      {
        id: firstMsgId,
        role: "assistant",
        content: report,
        sources: [],
        suggestions,
      },
    ]);
  };

  useEffect(() => {
    if (isDemoMode) {
      loadCompletedProject(DEMO_PROJECT_ID, DEMO_ANALYSIS_REPORT, DEMO_PROJECT);
      toast.success("Demo project loaded — ready for screenshots");
      return;
    }

    if (projectParam) {
      getProjectStatus(projectParam)
        .then((statusRes) => {
          if (statusRes.data.status === "completed" && statusRes.data.analysisReport) {
            loadCompletedProject(projectParam, statusRes.data.analysisReport, statusRes.data);
          } else {
            toast.error("Project not ready yet. Use ?demo=true for offline demo.");
          }
        })
        .catch(() => {
          toast.error("Could not load project. Use ?demo=true for offline demo.");
        });
    }
  }, [isDemoMode, projectParam]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [pollingInterval]);

  // Handle Zip File Selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".zip")) {
      toast.error("Please upload a .zip file");
      return;
    }
    // Configurable limit logic on backend, keep loose here or match backend config
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    setProjectData((prev) => ({ ...prev, file: file }));
    toast.success("File selected: " + file.name);
  };

  // Handle Next Step
  const handleNextStep = () => {
    if (sourceType === "zip" && !projectData.file) {
      toast.error("Please select a zip file");
      return;
    }
    if (sourceType === "github") {
      if (!projectData.githubUrl) {
        toast.error("Please enter a GitHub URL");
        return;
      }

      let rawUrl = projectData.githubUrl.trim();

      // Fix for duplicated URLs if they accidentally paste it weirdly
      if (rawUrl.split("https://").length > 2) {
        const parts = rawUrl.split("https://").filter(Boolean);
        rawUrl = "https://" + parts[parts.length - 1];
        setProjectData(p => ({ ...p, githubUrl: rawUrl }));
        toast.success("Automatically cleaned duplicated URL format.");
      }

      if (!rawUrl.includes("github.com")) {
        toast.error("Please enter a valid GitHub repository URL");
        return;
      }
      
      if (projectData.githubToken && !projectData.githubToken.startsWith("gh")) {
        toast.error("Invalid GitHub Token format. Typically starts with 'ghp_', 'github_pat_', etc.");
        return;
      }
    }
    // Skip step 2 and start directly
    handleStartAnalysis();
  };

  // Start Analysis (Create Project)
  const handleStartAnalysis = async () => {
    setIsUploading(true);
    setUploadProgress(10); // Initial progress

    try {
      const formData = new FormData();
      formData.append("name", `Project - ${Date.now()} `);
      formData.append("type", sourceType);

      if (sourceType === "zip") {
        formData.append("file", projectData.file);
      } else {
        formData.append("repoUrl", projectData.githubUrl);
        if (projectData.githubToken) {
          formData.append("githubToken", projectData.githubToken);
        }
      }

      const response = await createProject(formData);
      const pid = response.data.data._id;
      setProjectId(pid);
      setUploadProgress(50);

      // Start polling for status
      const interval = setInterval(async () => {
        try {
          const statusRes = await getProjectStatus(pid);
          const status = statusRes.data.data.status;

          if (status === "completed") {
            clearInterval(interval);
            setUploadProgress(100);
            setIsUploading(false);
            setShowUploadModal(false);

            let reportText = statusRes.data.data.analysisReport || "Analysis complete, but no report was generated.";
            let parsedSuggestions = [];

            if (/---+?\s*SUGGESTED_QUESTIONS\s*---+?/i.test(reportText)) {
              const parts = reportText.split(/---+?\s*SUGGESTED_QUESTIONS\s*---+?/i);
              reportText = parts[0].trim();
              if (parts[1]) {
                parsedSuggestions = parts[1].split('\n')
                  .filter(line => line.trim().startsWith('-'))
                  .map(line => line.replace('-', '').trim());
              }
            }

            // Add Analysis Report as first message
            const firstMsgId = "report-" + Date.now();
            setTypingMsgId(firstMsgId);
            setMessages([
              {
                id: firstMsgId,
                role: "assistant",
                content: reportText,
                sources: [],
                suggestions: parsedSuggestions,
              },
            ]);
            toast.success("Project analysis complete");
          } else if (status === "failed") {
            clearInterval(interval);
            setPollingInterval(null);
            setIsUploading(false);
            const errMsg = statusRes.data.data.errorMessage || "Project processing failed on server.";
            toast.error(errMsg, { duration: 6000 });
          } else {
            // Slowly increment progress fake visual
            setUploadProgress((prev) => Math.min(prev + 5, 90));
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 2000);

      setPollingInterval(interval);
    } catch (error) {
      setIsUploading(false);
      console.error(error);
      toast.error("Failed to start analysis. Check backend.");
    }
  };

  const handleSendMessage = async (eOrStr) => {
    if (eOrStr?.preventDefault) {
      eOrStr.preventDefault();
    }

    const messageText = typeof eOrStr === "string" ? eOrStr : input;
    if (!messageText.trim() || !projectId) return;

    const userMsg = { id: Date.now(), role: "user", content: messageText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      let responseData;

      if (isDemoMode) {
        await new Promise((r) => setTimeout(r, 800));
        responseData = getDemoChatResponse(messageText);
      } else {
        const response = await chatWithProject(projectId, userMsg.content);
        responseData = response.data.data;
      }

      const newAiId = Date.now() + 1;
      const aiMsg = {
        id: newAiId,
        role: "assistant",
        content: responseData.answer,
        sources: responseData.sources,
        suggestions: responseData.suggestions,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setTypingMsgId(newAiId);
    } catch (error) {
      console.error(error);
      toast.error("Failed to get answer");
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "I'm sorry, I encountered an error answering that query.",
          sources: [],
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-screen w-full bg-canvas flex overflow-hidden font-body text-obsidian relative">
      {/* Upload/Setup Modal Overlay */}
      {showUploadModal && (
        <div className="absolute inset-0 z-100 bg-zinc-950/20 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-border shadow-2xl rounded-2xl w-full max-w-lg p-5 sm:p-6 relative animate-in fade-in zoom-in duration-300">


            {/* Wizard Header */}
            <div className="mb-4 sm:mb-5">
              <h2 className="text-2xl sm:text-2xl font-display font-semibold mb-1 tracking-tight">
                Project Analysis Setup
              </h2>
              <p className="text-xs sm:text-sm text-subtle leading-relaxed">
                {isUploading
                  ? "decoding infrastructure & logic structures..."
                  : "Configure Project Source"}
              </p>
            </div>

            {isUploading ? (
              <div className="space-y-4">
                <div className="flex justify-center mb-6">
                  <Loader2 className="animate-spin text-obsidian w-12 h-12" />
                </div>
                <div className="text-center font-mono text-xs text-subtle uppercase tracking-widest mb-2">
                  Analyzing repository...
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-obsidian h-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <>
                {setupStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-lg">
                      <button
                        onClick={() => setSourceType("zip")}
                        className={`py-2 text-sm font-medium rounded-md transition-all ${sourceType === "zip" ? "bg-white shadow-sm text-obsidian" : "text-subtle hover:text-obsidian"}`}
                      >
                        Upload ZIP
                      </button>
                      <button
                        onClick={() => setSourceType("github")}
                        className={`py-2 text-sm font-medium rounded-md transition-all ${sourceType === "github" ? "bg-white shadow-sm text-obsidian" : "text-subtle hover:text-obsidian"}`}
                      >
                        GitHub Repo
                      </button>
                    </div>

                    <div className="min-h-25 flex flex-col justify-center">
                      {sourceType === "zip" ? (
                        <div className="relative group border-2 border-dashed border-zinc-200 rounded-xl p-5 text-center hover:border-obsidian/30 transition-colors">
                          <input
                            type="file"
                            accept=".zip"
                            onChange={handleFileSelect}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <UploadCloud className="w-10 h-10 mx-auto text-zinc-300 mb-4 group-hover:scale-110 transition-transform" />
                          <p className="text-sm font-medium text-obsidian mb-1">
                            {projectData.file
                              ? projectData.file.name
                              : "Drop zip file here or click to upload"}
                          </p>
                          <p className="text-xs text-subtle">Max size: 10MB</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="relative">
                            <Github className="absolute left-3 top-2.5 w-5 h-5 text-zinc-400" />
                            <input
                              type="text"
                              placeholder="https://github.com/username/repo"
                              value={projectData.githubUrl}
                              onChange={(e) =>
                                setProjectData((prev) => ({
                                  ...prev,
                                  githubUrl: e.target.value,
                                }))
                              }
                              className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-obsidian transition-colors font-mono"
                            />
                          </div>
                          <div className="relative mt-2">
                            <input
                              type={showToken ? "text" : "password"}
                              placeholder="Personal Access Token (optional for public)"
                              value={projectData.githubToken || ""}
                              onChange={(e) =>
                                setProjectData((prev) => ({
                                  ...prev,
                                  githubToken: e.target.value,
                                }))
                              }
                              className="w-full pl-4 pr-10 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-obsidian transition-colors font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setShowToken(!showToken)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-obsidian transition-colors"
                            >
                              {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                          <div className="flex items-start gap-1.5 mt-2 px-1">
                            <Info className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-zinc-500 leading-tight">
                              Private repos require a PAT with <code className="bg-zinc-100 text-obsidian px-1 py-0.5 rounded font-mono">repo</code> scope.{" "}
                              <a 
                                href="https://github.com/settings/tokens/new" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-obsidian hover:underline inline-flex items-center gap-0.5 font-medium"
                              >
                                Generate one here <ExternalLink size={10} />
                              </a>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleNextStep}
                      className="w-full py-3 bg-obsidian text-white rounded-lg font-mono text-xs uppercase hover:bg-zinc-800 transition-colors shadow-lg shadow-obsidian/20"
                    >
                      Start Analysis
                    </button>

                    {/* Technical Notes */}
                    <div className="mt-4 p-4 bg-zinc-50/80 border border-zinc-200 rounded-xl space-y-2">
                      <div className="flex items-center gap-2.5 text-obsidian">
                        <div className="p-1 bg-zinc-200/50 rounded-md">
                          <Info size={14} className="text-obsidian" />
                        </div>
                        <span className="font-mono text-[10px] uppercase font-bold tracking-widest">
                          Audit Constraints
                        </span>
                      </div>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3 text-[11px] text-zinc-600 leading-relaxed">
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 mt-1.5 shrink-0"></div>
                          <p>
                            Large repositories (
                            <span className="font-mono text-obsidian font-bold">
                              {">"}10MB
                            </span>{" "}
                            or{" "}
                            <span className="font-mono text-obsidian font-bold">
                              500+ files
                            </span>
                            ) may take <strong>10+ minutes</strong> to fully
                            index and analyze.
                          </p>
                        </li>
                        <li className="flex items-start gap-3 text-[11px] text-zinc-600 leading-relaxed">
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 mt-1.5 shrink-0"></div>
                          <p>
                            For optimal accuracy, upload projects with a{" "}
                            <strong>single language/framework</strong> (e.g.,
                            just the React frontend).
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {setupStep === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <MultiSelectSearch
                        label="Programming Language"
                        placeholder="Select languages (e.g. JavaScript, Python)"
                        options={["JavaScript", "TypeScript", "Node.js", "Python", "Java", "C#", "Go", "Rust", "PHP", "Ruby", "C++", "Swift", "Kotlin"]}
                        selected={projectData.language || []}
                        onChange={(val) => setProjectData(p => ({ ...p, language: val }))}
                      />

                      <MultiSelectSearch
                        label="Framework / Library Ecosystem"
                        placeholder="Select frameworks (e.g. React, Next.js, Django)"
                        options={["React", "Next.js", "Vue", "Angular", "Svelte", "Express", "Django", "Flask", "Spring Boot", ".NET Core", "Laravel", "Ruby on Rails", "NestJS"]}
                        selected={projectData.framework || []}
                        onChange={(val) => setProjectData(p => ({ ...p, framework: val }))}
                      />

                      <MultiSelectSearch
                        label="Tools, DBs & Integrations"
                        placeholder="Select tools (e.g. Tailwind, Redis, Docker)"
                        options={["TailwindCSS", "PostgreSQL", "MongoDB", "Redis", "Docker", "Kubernetes", "GraphQL", "Prisma", "AWS", "Firebase", "Redux", "Zustand", "Material UI"]}
                        selected={projectData.tools || []}
                        onChange={(val) => setProjectData(p => ({ ...p, tools: val }))}
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setSetupStep(1)}
                        className="flex-1 py-3 border border-zinc-200 text-obsidian rounded-lg font-mono text-xs uppercase hover:bg-zinc-50 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleStartAnalysis}
                        className="flex-1 py-3 bg-obsidian text-white rounded-lg font-mono text-xs uppercase hover:bg-zinc-800 transition-colors shadow-lg shadow-obsidian/20"
                      >
                        Start Analysis
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Manual Modal */}
      {showManual && (
        <div className="absolute inset-0 z-60 bg-white/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-border shadow-2xl rounded-xl w-full max-w-2xl p-8 relative overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 bg-obsidian"></div>
            <button
              onClick={() => setShowManual(false)}
              className="absolute top-6 right-8 text-subtle hover:text-obsidian transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-8 pr-12">
              <h2 className="text-2xl font-display font-semibold mb-2 flex items-center gap-3">
                <HelpCircle className="text-brand-blue" />
                Oravia Audit Manual
              </h2>
              <p className="text-sm text-subtle font-body">
                Master the architectural intelligence engine for superior
                codebase audits.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-8 pr-2">
              <section>
                <h3 className="text-xs font-mono uppercase tracking-widest text-obsidian mb-4 flex items-center gap-2">
                  <div className="w-4 h-px bg-zinc-200"></div> How it Works
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-100">
                    <div className="font-bold text-sm mb-1 text-obsidian">
                      RAG-Powered Retrieval
                    </div>
                    <p className="text-xs text-subtle leading-relaxed">
                      Oravia indexes your entire codebase into a vector
                      database. When you ask a question, it finds the most
                      relevant "logic clusters" to provide context-aware
                      answers.
                    </p>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-100">
                    <div className="font-bold text-sm mb-1 text-obsidian">
                      Gemini 1.5 Reasoning
                    </div>
                    <p className="text-xs text-subtle leading-relaxed">
                      Advanced language models analyze the retrieved code to
                      explain architectural lineage, find bottlenecks, and
                      identify technical debt.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-mono uppercase tracking-widest text-obsidian mb-4 flex items-center gap-2">
                  <div className="w-4 h-px bg-zinc-200"></div> Sample Audit
                  Queries
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      q: "What is the core architectural pattern used here?",
                      a: "Analyzes high-level structure and directory mapping.",
                    },
                    {
                      q: "Explain the data flow from API to Database for the User module.",
                      a: "Traces logic through services and repositories.",
                    },
                    {
                      q: "Identify potential security risks in the authentication logic.",
                      a: "Finds vulnerabilities like unsanitized input or missing checks.",
                    },
                    {
                      q: "Where can I refactor to reduce technical debt?",
                      a: "Highlights complex methods or duplicated logic blocks.",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex flex-col p-3 border border-zinc-100 rounded-md hover:border-obsidian/10 transition-colors"
                    >
                      <div className="text-xs font-bold text-obsidian font-mono">
                        Q: {item.q}
                      </div>
                      <div className="text-[11px] text-subtle mt-1 italic">
                        {item.a}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-mono uppercase tracking-widest text-obsidian mb-4 flex items-center gap-2">
                  <div className="w-4 h-px bg-zinc-200"></div> Key Features
                </h3>
                <ul className="space-y-2 text-[11px] text-obsidian font-body">
                  <li className="flex items-start gap-2.5">
                    <div className="w-1 h-1 rounded-full bg-brand-emerald mt-1.5 shrink-0"></div>
                    <span>
                      <strong>Lineage Tracing:</strong> Understand why a
                      component was designed this way.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-1 h-1 rounded-full bg-brand-blue mt-1.5 shrink-0"></div>
                    <span>
                      <strong>Contextual Reviews:</strong> AI audits specific
                      code files within the larger system.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-1 h-1 rounded-full bg-brand-red mt-1.5 shrink-0"></div>
                    <span>
                      <strong>Risk Scoring:</strong> Highlights mission-critical
                      brittle logic immediately.
                    </span>
                  </li>
                </ul>
              </section>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-100">
              <button
                onClick={() => setShowManual(false)}
                className="w-full py-3 bg-obsidian text-white rounded-lg font-mono text-xs uppercase hover:bg-zinc-800 transition-colors"
              >
                I Understand, Return to Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setShowSidebar(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`w-70 sm:w-64 border-r border-border bg-zinc-50/50 flex flex-col p-4 md:p-6 fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${showSidebar ? "bg-white translate-x-0 shadow-2xl" : "-translate-x-full"}`}
      >
        <div className="flex flex-col gap-6 mb-8 px-1 md:px-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/favicon.svg" alt="Oravia" className="w-6 h-6" />
              <span className="font-display font-bold text-sm tracking-tight">
                ORAVIA
              </span>
            </div>
            <button
              onClick={() => setShowSidebar(false)}
              className="md:hidden text-subtle hover:text-obsidian"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto">
          <div className="px-2 py-1.5 text-[10px] font-mono uppercase text-subtle tracking-wider mb-2">
            Active Context
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="w-full text-left px-3 py-3 text-xs font-medium text-obsidian bg-white border border-border shadow-sm rounded-lg flex items-center justify-between group hover:border-obsidian/30 transition-all hover:shadow-md"
          >
            <span className="truncate">
              {projectData.githubUrl && (isDemoMode || projectId)
                ? "ShopFlow E-Commerce API"
                : projectData.file
                  ? projectData.file.name
                  : projectData.githubUrl
                    ? "GitHub Repo"
                    : projectId
                      ? `Audit Session ${projectId.substr(0, 4)} `
                      : "Initialize Audit"}
            </span>
            <div className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse"></div>
          </button>

          <div className="px-2 py-1.5 text-[10px] font-mono uppercase text-subtle tracking-wider mt-6 mb-2">
            Resources
          </div>
          <button
            onClick={() => setShowManual(true)}
            className="w-full text-left px-3 py-2 text-xs font-medium text-obsidian bg-white border border-border shadow-sm rounded-lg flex items-center gap-3 group hover:border-obsidian/30 transition-all hover:shadow-md"
          >
            <HelpCircle
              size={14}
              className="text-subtle group-hover:text-obsidian"
            />
            <span>Audit Manual</span>
          </button>
        </nav>

        <div className="border-t border-border pt-4 mt-auto space-y-4">
          <div className="px-3 space-y-2">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Info size={10} />
              <span className="font-mono text-[9px] uppercase font-bold tracking-tight">
                Audit Notes
              </span>
            </div>
            <p className="text-[9px] text-subtle leading-tight italic">
              • Projects with 500+ files may take 10m+ to index.
              <br />• Use single-framework repos for best accuracy.
            </p>
          </div>

          <div className="px-2 py-2 bg-obsidian text-white rounded-lg p-4 flex flex-col gap-2">
            <div className="font-mono text-[9px] uppercase tracking-tighter opacity-70">
              Infrastructure Status
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald"></div>
              <span className="text-[10px] font-bold">ALL SYSTEMS NOMINAL</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-mono uppercase text-subtle hover:text-brand-red hover:bg-brand-red/5 rounded-md transition-colors border border-transparent hover:border-brand-red/10"
          >
            <LogOut size={12} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative bg-white w-full min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-3 md:px-6 bg-white/80 backdrop-blur-sm z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(true)}
              className="md:hidden text-subtle hover:text-obsidian p-1"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="font-mono text-[10px] text-subtle hidden lg:inline shrink-0">
                SESSION_ID:
              </span>
              <span className="font-mono text-[10px] md:text-xs text-obsidian truncate max-w-30 sm:max-w-none">
                {projectId || "PENDING..."}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-100 rounded text-[9px] md:text-[10px] font-mono text-subtle border border-zinc-200">
              <Database size={10} />
              <span className="hidden xs:inline">VECTOR_INDEX_ACTIVE</span>
              <span className="xs:hidden">IDX: ON</span>
            </div>
          </div>
        </header>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-8 space-y-6 scroll-smooth">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 md:gap-4 max-w-4xl mx-auto ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 md:w-8 md:h-8 shrink-0 flex items-center justify-center text-white ${msg.role === "assistant" ? "" : "bg-zinc-200 rounded-full"}`}
              >
                {msg.role === "assistant" ? (
                  <img src="/favicon.svg" alt="O" className="w-6 h-6 md:w-8 md:h-8" />
                ) : (
                  <div className="w-4 h-4 bg-subtle rounded-full"></div>
                )}
              </div>

              {/* Content */}
              <div
                className={`space-y-2 max-w-[calc(100%-2.5rem)] sm:max-w-[85%] md:max-w-[80%] flex flex-col ${msg.role === "user" ? "items-end" : "items-start w-full"}`}
              >
                <div className="font-mono text-[9px] md:text-[10px] text-subtle uppercase opacity-50 px-1">
                  {msg.role === "assistant"
                    ? "Oravia Intelligence"
                    : "Technical Lead"}
                </div>
                <div
                  className={`text-sm leading-relaxed p-3 md:p-4 rounded-xl border text-left inline-block ${msg.role === "assistant" ? "bg-white border-border text-obsidian shadow-sm w-full" : "bg-obsidian text-white border-transparent shadow-md max-w-fit"} ${msg.id.toString().startsWith("report") ? "report-card" : ""}`}
                >
                  <div className={msg.id.toString().startsWith("report") ? "prose-report" : "whitespace-pre-wrap text-wrap"}>
                    {typingMsgId === msg.id ? (
                      <TypewriterMarkdown
                        content={msg.content}
                        onComplete={() => setTypingMsgId(null)}
                      />
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ inline, children, className, ...props }) {
                            const match = /language-(\w+)/.exec(className || "");
                            return !inline && match ? (
                              <div className="bg-zinc-900 text-zinc-100 p-2 rounded-md my-2 overflow-x-auto text-xs font-mono">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </div>
                            ) : (
                              <code
                                className="bg-zinc-100 px-1 py-0.5 rounded font-mono text-xs text-obsidian"
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          },
                          table({ children, ...props }) {
                            return (
                              <div className="overflow-x-auto my-4 border border-zinc-200 rounded-lg">
                                <table className="min-w-full divide-y divide-zinc-200 text-sm table-auto" {...props}>
                                  {children}
                                </table>
                              </div>
                            );
                          },
                          th({ children, ...props }) {
                            return <th className="px-4 py-3 bg-zinc-50 font-semibold text-left text-obsidian border-b border-zinc-200" {...props}>{children}</th>;
                          },
                          td({ children, ...props }) {
                            return <td className="px-4 py-3 border-b border-zinc-100/50 align-top" {...props}>{children}</td>;
                          },
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>

                {/* Sources (Only for Assistant and when not typing) */}
                {msg.sources && msg.sources.length > 0 && typingMsgId !== msg.id && (
                  <div className="flex flex-wrap gap-2 mt-2 justify-start animate-in fade-in duration-500">
                    {msg.sources.map((src, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-2 py-1 bg-zinc-50 border border-border rounded text-[10px] font-mono text-subtle hover:border-obsidian/30 cursor-pointer transition-colors group"
                      >
                        <FileCode
                          size={11}
                          className="group-hover:text-brand-blue"
                        />
                        <span className="group-hover:text-obsidian truncate max-w-37.5">
                          {src.file}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggested Questions (Only for Assistant and when not typing) */}
                {msg.suggestions && msg.suggestions.length > 0 && typingMsgId !== msg.id && (
                  <div className="flex flex-col mt-6 w-full animate-in fade-in slide-in-from-bottom-2 duration-700">
                    <div className="flex items-center gap-1 mb-2.5">
                      <Sparkles size={12} className="text-brand-emerald" />
                      <span className="text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-widest">
                        Suggested Follow-ups
                      </span>
                    </div>
                    <div className="flex flex-col gap-2.5 w-full">
                      {msg.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(suggestion)}
                          className="group flex items-start sm:items-center gap-3 text-left w-full sm:w-fit max-w-[95%] py-2.5 px-4 bg-linear-to-r from-brand-emerald/5 to-transparent border border-brand-emerald/20 rounded-2xl hover:border-brand-emerald/40 hover:from-brand-emerald/10 transition-all shadow-sm hover:shadow active:scale-[0.99]"
                        >
                          <div className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-white border border-brand-emerald/20 text-brand-emerald shadow-xs mt-0.5 sm:mt-0">
                            <ChevronRight size={14} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
                          </div>
                          <span className="text-[13px] font-body text-zinc-700 group-hover:text-obsidian leading-snug py-0.5">
                            {suggestion}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Get Prompt for Fix Button */}
                {msg.role === "assistant" && typingMsgId !== msg.id && (
                  <div className="mt-4 flex w-full justify-start">
                    <button
                      onClick={() => handleOpenPromptModal(msg.content)}
                      className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-brand-blue hover:text-blue-700 bg-brand-blue/5 hover:bg-brand-blue/10 px-3 py-2 rounded-lg transition-colors shadow-sm border border-brand-blue/20 hover:border-brand-blue/40"
                    >
                      <Wand2 size={13} /> Get prompt for fix
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2 md:gap-4 max-w-4xl mx-auto">
              {/* Avatar */}
              <div className="w-7 h-7 md:w-8 md:h-8 shrink-0 flex items-center justify-center text-white">
                <img src="/favicon.svg" alt="O" className="w-6 h-6 md:w-8 md:h-8 animate-pulse" />
              </div>

              {/* Content */}
              <div className="space-y-1.5 max-w-[calc(100%-2.5rem)] sm:max-w-[85%] md:max-w-[80%] flex flex-col items-start w-full">
                <div className="font-mono text-[9px] md:text-[10px] text-subtle uppercase opacity-50 px-1">
                  Oravia Intelligence
                </div>
                <div className="text-sm rounded-full border border-zinc-200 mt-1 inline-flex bg-zinc-50 shadow-sm w-fit px-4 py-3 items-center justify-center relative overflow-hidden">
                  <div className="flex gap-1.5 items-center justify-center opacity-70">
                    <div className="w-1.5 h-1.5 bg-obsidian rounded-full animate-[pulse_1.5s_ease-in-out_infinite]"></div>
                    <div className="w-1.5 h-1.5 bg-obsidian rounded-full animate-[pulse_1.5s_ease-in-out_0.2s_infinite]"></div>
                    <div className="w-1.5 h-1.5 bg-obsidian rounded-full animate-[pulse_1.5s_ease-in-out_0.4s_infinite]"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 sm:p-4 md:p-6 border-t border-border bg-canvas/30">
          <form
            onSubmit={handleSendMessage}
            className="max-w-3xl mx-auto relative group"
          >
            <div className="absolute inset-0 bg-linear-to-r from-brand-blue/10 to-brand-red/10 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"></div>
            <div className="relative bg-white border border-border rounded-lg shadow-sm flex items-center p-1 md:p-1.5 gap-1 md:gap-2 focus-within:border-obsidian/40 focus-within:ring-1 focus-within:ring-obsidian/5 transition-all pl-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about your codebase..."
                className="flex-1 bg-transparent text-sm text-obsidian placeholder:text-zinc-400 focus:outline-none font-body min-w-0"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2 bg-obsidian text-white rounded-md hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
            <div className="text-center mt-2 flex items-center justify-center gap-2">
              <div className="w-1 h-1 rounded-full bg-brand-emerald"></div>
              <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-tighter">
                Gemini Intelligence Engaged
              </span>
            </div>
          </form>
        </div>
      </main>
      {/* Prompt Generation Modal */}
      {promptModalData && (
        <div className="absolute inset-0 z-100 bg-zinc-950/20 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-border shadow-2xl rounded-2xl w-full max-w-3xl p-5 sm:p-6 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-obsidian flex items-center gap-2"><Wand2 size={18} className="text-brand-blue" /> Generate Fix Prompt</h2>
              <button onClick={() => setPromptModalData(false)} className="text-subtle hover:text-obsidian"><X size={20} /></button>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Target AI / IDE</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {IDE_OPTIONS.map(ide => (
                  <button
                    key={ide}
                    onClick={() => setSelectedIde(ide)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${selectedIde === ide
                        ? 'bg-obsidian text-white border-obsidian shadow-md'
                        : 'bg-zinc-50 text-subtle border-border hover:bg-zinc-100 hover:text-obsidian'
                      }`}
                  >
                    {ide === 'VS Code Copilot' && <Code size={14} />}
                    {ide === 'Cursor' && <Terminal size={14} />}
                    {ide === 'Claude' && <Bot size={14} />}
                    {ide === 'Antigravity' && <Sparkles size={14} />}
                    {ide === 'Codex' && <Cpu size={14} />}
                    {ide}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col flex-1 overflow-hidden min-h-0">
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Issue Context (Editable)</label>
              <textarea
                rows="6"
                value={promptContext}
                onChange={(e) => setPromptContext(e.target.value)}
                className="w-full min-h-[120px] bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-sm font-mono text-obsidian focus:outline-none focus:border-brand-blue resize-y mb-4"
              />

              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Final Generated Prompt</label>
              <div className="flex-1 bg-zinc-900 rounded-lg p-4 text-zinc-300 text-sm font-mono overflow-y-auto whitespace-pre-wrap text-wrap border border-zinc-800">
                {generateTailoredPrompt()}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3 shrink-0">
              <button onClick={() => setPromptModalData(false)} className="px-4 py-2 text-sm font-medium text-obsidian bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={handleCopyPrompt} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-obsidian hover:bg-zinc-800 rounded-lg transition-colors">
                {copiedPrompt ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy to Clipboard</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;

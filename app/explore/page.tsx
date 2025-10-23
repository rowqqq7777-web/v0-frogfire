"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { LiquidBackground } from "@/components/liquid-background"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Heart,
  Search,
  Clock,
  Sparkles,
  TrendingUp,
  Bookmark,
  MessageCircle,
  Crown,
  Send,
  Lock,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Users,
} from "lucide-react"
import { StorageManager } from "@/components/storage-manager"
import type { AnalysisResult, Comment, Reply } from "@/lib/types"
import { useRouter } from "next/router"
import { AIMentoring } from "@/components/ai-mentoring"
import { useAuth } from "@/lib/auth-context"

type SortOption = "recent" | "popular"
type TabOption = "all" | "saved"
type DetailTabOption = "strengths" | "improvements"

export default function ExplorePage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("recent")
  const [tab, setTab] = useState<TabOption>("all")
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([])
  const [trendingAnalyses, setTrendingAnalyses] = useState<AnalysisResult[]>([])
  const [recommendedAnalyses, setRecommendedAnalyses] = useState<AnalysisResult[]>([])
  const [interaction, setInteraction] = useState(StorageManager.getInteraction())
  const [detailTab, setDetailTab] = useState<DetailTabOption>("strengths")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()
  const [showAIMentoring, setShowAIMentoring] = useState(false)

  const isGuest = user?.isGuest || false

  useEffect(() => {
    loadAnalyses()
  }, [])

  useEffect(() => {
    setRecommendedAnalyses(StorageManager.getPersonalizedRecommendations(searchQuery))
  }, [searchQuery])

  const loadAnalyses = () => {
    const allAnalyses = StorageManager.getPublicAnalyses()
    setAnalyses(allAnalyses)
    setTrendingAnalyses(StorageManager.getTrendingAnalyses())
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    loadAnalyses()
    setIsRefreshing(false)
  }

  const filteredAnalyses = analyses
    .filter((analysis) => {
      if (tab === "saved" && !interaction.savedAgents.has(analysis.id)) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim()
        const studentTitle = `${analysis.studentId || ""}${analysis.studentName}`.toLowerCase()
        const strengthsText = analysis.strengths.join(" ").toLowerCase()
        const improvementsText = analysis.improvements.join(" ").toLowerCase()

        return (
          studentTitle.includes(query) ||
          analysis.studentName.toLowerCase().includes(query) ||
          (analysis.studentId && analysis.studentId.toLowerCase().includes(query)) ||
          strengthsText.includes(query) ||
          improvementsText.includes(query)
        )
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      } else {
        return b.likes - a.likes
      }
    })

  const topAnalysis = sortBy === "popular" && filteredAnalyses.length > 0 ? filteredAnalyses[0] : null

  const toggleLike = (analysisId: string) => {
    const newInteraction = { ...interaction }
    const analysis = analyses.find((a) => a.id === analysisId)
    if (!analysis) return

    if (newInteraction.likedAgents.has(analysisId)) {
      newInteraction.likedAgents.delete(analysisId)
      StorageManager.updateAnalysis(analysisId, { likes: Math.max(0, analysis.likes - 1) })
    } else {
      newInteraction.likedAgents.add(analysisId)
      StorageManager.updateAnalysis(analysisId, { likes: analysis.likes + 1 })
    }
    setInteraction(newInteraction)
    StorageManager.saveInteraction(newInteraction)
    loadAnalyses()
  }

  const toggleSave = (analysisId: string) => {
    const newInteraction = { ...interaction }
    const analysis = analyses.find((a) => a.id === analysisId)
    if (!analysis) return

    if (newInteraction.savedAgents.has(analysisId)) {
      newInteraction.savedAgents.delete(analysisId)
      StorageManager.updateAnalysis(analysisId, { saves: Math.max(0, analysis.saves - 1) })
    } else {
      newInteraction.savedAgents.add(analysisId)
      StorageManager.updateAnalysis(analysisId, { saves: analysis.saves + 1 })
    }
    setInteraction(newInteraction)
    StorageManager.saveInteraction(newInteraction)
    loadAnalyses()
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gray-50">
      <LiquidBackground />
      <Navigation />

      <div className="relative z-10 h-full overflow-y-auto px-4 pb-20 pt-4">
        <div className="max-w-4xl mx-auto space-y-2.5">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-0.5 mb-1.5"
          >
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">탐색</h1>
            <p className="text-xs text-gray-600">새로운 생기부를 만나보세요.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <GlassCard className="p-2.5 space-y-2">
              {isGuest && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-amber-800 font-medium">비회원 모드</p>
                    <p className="text-[10px] text-amber-700 mt-0.5">
                      탐색, 멘토링, 공유 기능은 회원만 사용할 수 있습니다.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-1.5">
                <Button
                  onClick={() => {
                    if (isGuest) {
                      alert("회원만 사용할 수 있는 기능입니다.")
                      return
                    }
                    setShowAIMentoring(true)
                  }}
                  disabled={isGuest}
                  className={`flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-8 text-xs font-medium shadow-md ${
                    isGuest ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Users className="w-3.5 h-3.5 mr-1" />
                  AI 멘토링
                </Button>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="생기부 검색"
                    className="pl-9 h-9 bg-white border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 rounded-lg text-sm placeholder:text-gray-400"
                  />
                </div>
              </div>

              {searchQuery && recommendedAnalyses.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">맞춤 추천</p>
                  <div className="flex flex-wrap gap-1.5">
                    {recommendedAnalyses.slice(0, 3).map((analysis) => (
                      <Badge
                        key={analysis.id}
                        variant="outline"
                        className="cursor-pointer hover:bg-black hover:text-white transition-colors text-xs"
                        onClick={() => setSearchQuery(analysis.studentName)}
                      >
                        {analysis.overallScore}점
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {trendingAnalyses.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">인기 급상승</p>
                  <div className="flex flex-wrap gap-1.5">
                    {trendingAnalyses.slice(0, 3).map((analysis) => {
                      const studentTitle = `${analysis.studentId || "1405"}${analysis.studentName.replace(/\*/g, "정후")}`
                      return (
                        <Badge
                          key={analysis.id}
                          variant="outline"
                          className="cursor-pointer hover:bg-black hover:text-white transition-colors text-xs"
                          onClick={() => {
                            const card = document.querySelector(`[data-analysis-id="${analysis.id}"]`)
                            if (card) {
                              card.scrollIntoView({ behavior: "smooth", block: "center" })
                              setTimeout(() => {
                                const detailButton = card.querySelector(
                                  "button[data-detail-button]",
                                ) as HTMLButtonElement
                                detailButton?.click()
                              }, 500)
                            }
                          }}
                        >
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {studentTitle}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex gap-1.5">
                  <Button
                    variant={tab === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTab("all")}
                    className={`rounded-full text-xs h-7 px-3 font-medium ${
                      tab === "all"
                        ? "bg-gray-900 text-white hover:bg-gray-800"
                        : "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    전체
                  </Button>
                  <Button
                    variant={tab === "saved" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTab("saved")}
                    className={`rounded-full text-xs h-7 px-3 font-medium ${
                      tab === "saved"
                        ? "bg-gray-900 text-white hover:bg-gray-800"
                        : "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <Bookmark className="w-3 h-3 mr-1" />
                    저장됨
                  </Button>
                </div>

                <div className="h-4 w-px bg-gray-200" />

                <div className="flex gap-1.5">
                  <Button
                    variant={sortBy === "recent" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy("recent")}
                    className={`rounded-full text-xs h-7 px-3 font-medium ${
                      sortBy === "recent"
                        ? "bg-gray-900 text-white hover:bg-gray-800"
                        : "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    최신순
                  </Button>
                  <Button
                    variant={sortBy === "popular" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy("popular")}
                    className={`rounded-full text-xs h-7 px-3 font-medium ${
                      sortBy === "popular"
                        ? "bg-gray-900 text-white hover:bg-gray-800"
                        : "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    인기순
                  </Button>
                </div>

                <div className="h-4 w-px bg-gray-200" />

                <motion.button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  animate={{ rotate: isRefreshing ? 360 : 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                  title="새로고침"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-gray-600" />
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>

          {analyses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <GlassCard className="p-8 text-center space-y-3">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 3, -3, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                  className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto"
                >
                  <Sparkles className="w-6 h-6 text-gray-400" />
                </motion.div>

                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-gray-900">생기부를 탐지하세요.</h3>
                  <p className="text-xs text-gray-600">나만의 생기부를 AI에게 맡겨보세요.</p>
                </div>

                <Button
                  onClick={() => (window.location.href = "/")}
                  className="rounded-full bg-gray-900 hover:bg-gray-800 text-white px-6 h-9 text-sm mt-2 font-medium"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  지금 시작
                </Button>
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-2.5"
            >
              <div className="flex items-center justify-between px-1">
                <h2 className="text-base font-semibold text-black">
                  {tab === "saved" ? "저장된 분석" : "모든 분석"} ({filteredAnalyses.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {filteredAnalyses.map((analysis, index) => (
                  <motion.div
                    key={analysis.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.03 }}
                  >
                    <AnalysisCard
                      analysis={analysis}
                      liked={interaction.likedAgents.has(analysis.id)}
                      saved={interaction.savedAgents.has(analysis.id)}
                      isTopRanked={topAnalysis?.id === analysis.id}
                      onToggleLike={toggleLike}
                      onToggleSave={toggleSave}
                      onReload={loadAnalyses}
                      detailTab={detailTab}
                      setDetailTab={setDetailTab}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {showAIMentoring && !isGuest && <AIMentoring onClose={() => setShowAIMentoring(false)} />}
    </div>
  )
}

function AnalysisCard({
  analysis,
  liked,
  saved,
  isTopRanked,
  onToggleLike,
  onToggleSave,
  onReload,
  detailTab,
  setDetailTab,
}: {
  analysis: AnalysisResult
  liked: boolean
  saved: boolean
  isTopRanked: boolean
  onToggleLike: (id: string) => void
  onToggleSave: (id: string) => void
  onReload: () => void
  detailTab: DetailTabOption
  setDetailTab: (tab: DetailTabOption) => void
}) {
  const [showComments, setShowComments] = useState(false)
  const [commentInput, setCommentInput] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyInput, setReplyInput] = useState("")
  const [showDetail, setShowDetail] = useState(false)
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())
  const [nestedReplyTo, setNestedReplyTo] = useState<{ commentId: string; replyId: string } | null>(null)
  const [nestedReplyInput, setNestedReplyInput] = useState("")
  const commentSectionRef = useRef<HTMLDivElement>(null)
  const commentInputRef = useRef<HTMLInputElement>(null)
  const replyInputRef = useRef<HTMLInputElement>(null)
  const nestedReplyInputRef = useRef<HTMLInputElement>(null)

  const comments = analysis.comments || []
  const likes = analysis.likes || 0
  const saves = analysis.saves || 0

  const getUserDisplayName = () => {
    if (typeof window !== "undefined") {
      const storedStudentId = sessionStorage.getItem("student_id")
      const storedName = sessionStorage.getItem("student_name")

      if (storedStudentId && storedName) {
        return `${storedStudentId}${storedName}`
      }

      let userNumber = sessionStorage.getItem("user_display_number")
      if (!userNumber) {
        userNumber = String(Math.floor(Math.random() * 100) + 1)
        sessionStorage.setItem("user_display_number", userNumber)
      }
      return `학생${userNumber}`
    }
    return "사용자"
  }

  const addComment = () => {
    if (!commentInput.trim()) return

    const newComment: Comment = {
      id: Date.now().toString(),
      userId: "user-" + Date.now(),
      userName: getUserDisplayName(),
      content: commentInput,
      createdAt: new Date().toISOString(),
      replies: [],
      likes: 0,
    }

    const updatedComments = [...comments, newComment]
    StorageManager.updateAnalysis(analysis.id, { comments: updatedComments })
    setCommentInput("")
    onReload()

    setTimeout(() => {
      if (commentSectionRef.current) {
        commentSectionRef.current.scrollTop = commentSectionRef.current.scrollHeight
      }
    }, 100)
  }

  const addReply = (commentId: string) => {
    if (!replyInput.trim()) return

    const newReply: Reply = {
      id: Date.now().toString(),
      userId: "user-" + Date.now(),
      userName: getUserDisplayName(),
      content: replyInput,
      createdAt: new Date().toISOString(),
      likes: 0,
    }

    const updatedComments = comments.map((comment) => {
      if (comment.id === commentId) {
        return { ...comment, replies: [...(comment.replies || []), newReply] }
      }
      return comment
    })

    StorageManager.updateAnalysis(analysis.id, { comments: updatedComments })
    setReplyInput("")
    setReplyTo(null)
    const newExpanded = new Set(expandedReplies)
    newExpanded.add(commentId)
    setExpandedReplies(newExpanded)
    onReload()

    setTimeout(() => {
      if (commentSectionRef.current) {
        commentSectionRef.current.scrollTop = commentSectionRef.current.scrollHeight
      }
    }, 100)
  }

  const addNestedReply = (commentId: string, parentReplyId: string) => {
    if (!nestedReplyInput.trim()) return

    const newReply: Reply = {
      id: Date.now().toString(),
      userId: "user-" + Date.now(),
      userName: getUserDisplayName(),
      content: nestedReplyInput,
      createdAt: new Date().toISOString(),
      likes: 0,
      parentReplyId: parentReplyId,
    }

    const updatedComments = comments.map((comment) => {
      if (comment.id === commentId) {
        return { ...comment, replies: [...(comment.replies || []), newReply] }
      }
      return comment
    })

    StorageManager.updateAnalysis(analysis.id, { comments: updatedComments })
    setNestedReplyInput("")
    setNestedReplyTo(null)
    const newExpanded = new Set(expandedReplies)
    newExpanded.add(commentId)
    setExpandedReplies(newExpanded)
    onReload()

    setTimeout(() => {
      if (commentSectionRef.current) {
        commentSectionRef.current.scrollTop = commentSectionRef.current.scrollHeight
      }
    }, 100)
  }

  const toggleReplies = (commentId: string) => {
    const newExpanded = new Set(expandedReplies)
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId)
    } else {
      newExpanded.add(commentId)
    }
    setExpandedReplies(newExpanded)
  }

  const studentTitle = `${analysis.studentId || "1405"}${analysis.studentName.replace(/\*/g, "정후")}`

  useEffect(() => {
    if (showComments && commentInputRef.current) {
      const handleFocus = () => {
        setTimeout(() => {
          if (commentSectionRef.current) {
            commentSectionRef.current.scrollTop = commentSectionRef.current.scrollHeight
          }
        }, 300)
      }

      commentInputRef.current.addEventListener("focus", handleFocus)

      return () => {
        commentInputRef.current?.removeEventListener("focus", handleFocus)
      }
    }
  }, [showComments])

  useEffect(() => {
    if (replyTo && replyInputRef.current) {
      setTimeout(() => {
        if (commentSectionRef.current) {
          commentSectionRef.current.scrollTop = commentSectionRef.current.scrollHeight
        }
      }, 100)
    }
  }, [replyTo])

  useEffect(() => {
    if (nestedReplyTo && nestedReplyInputRef.current) {
      setTimeout(() => {
        if (commentSectionRef.current) {
          commentSectionRef.current.scrollTop = commentSectionRef.current.scrollHeight
        }
      }, 100)
    }
  }, [nestedReplyTo])

  return (
    <>
      <GlassCard
        className="p-3.5 space-y-2.5 h-full hover:shadow-lg transition-all rounded-2xl"
        hover
        data-analysis-id={analysis.id}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-black/5 flex items-center justify-center relative">
              <FileText className="w-4.5 h-4.5 text-black" />
              {isTopRanked && (
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.6 }}
                  className="absolute -top-1.5 -right-1.5"
                >
                  <Crown className="w-4.5 h-4.5 text-yellow-500 fill-yellow-500" />
                </motion.div>
              )}
              {analysis.isPrivate && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5">
                  <Lock className="w-2.5 h-2.5 text-gray-600" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-sm text-black line-clamp-1">{studentTitle}</h3>
              <p className="text-[10px] text-gray-400">{new Date(analysis.uploadDate).toLocaleDateString("ko-KR")}</p>
            </div>
          </div>
          <div className="text-xl font-bold text-black">{analysis.overallScore}점</div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs text-gray-600">강점 {analysis.strengths.length}개</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-orange-600" />
            <span className="text-xs text-gray-600">보완 {analysis.improvements.length}개</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1.5 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleLike(analysis.id)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-black transition-colors"
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? "fill-black text-black" : ""}`} />
              <span className="font-medium">{likes}</span>
            </button>

            <button
              onClick={() => onToggleSave(analysis.id)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-black transition-colors"
            >
              <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-black text-black" : ""}`} />
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-black transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="font-medium">{comments.length}</span>
            </button>
          </div>

          <Button
            size="sm"
            onClick={() => setShowDetail(true)}
            data-detail-button
            className="rounded-full bg-black hover:bg-gray-800 text-white px-4 h-7 text-[11px] font-medium"
          >
            상세보기
          </Button>
        </div>

        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 pt-2 border-t border-gray-100"
          >
            <div ref={commentSectionRef} className="space-y-1.5 max-h-36 overflow-y-auto">
              {comments
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((comment) => (
                  <div key={comment.id} className="space-y-1">
                    <div className="bg-gray-50 rounded-lg p-2 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-black">{comment.userName}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                          className="text-xs text-gray-500 hover:text-black transition-colors"
                        >
                          답글
                        </button>
                        {comment.replies && comment.replies.length > 0 && (
                          <button
                            onClick={() => toggleReplies(comment.id)}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            {expandedReplies.has(comment.id) ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                            답글 {comment.replies.length}개
                          </button>
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedReplies.has(comment.id) && comment.replies && comment.replies.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="ml-4 space-y-1"
                        >
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="space-y-1">
                              <div className="bg-gray-50 rounded-lg p-2 space-y-0.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold text-black">{reply.userName}</span>
                                  <span className="text-xs text-gray-400">
                                    {new Date(reply.createdAt).toLocaleDateString("ko-KR")}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{reply.content}</p>
                                <button
                                  onClick={() =>
                                    setNestedReplyTo(
                                      nestedReplyTo?.replyId === reply.id
                                        ? null
                                        : { commentId: comment.id, replyId: reply.id },
                                    )
                                  }
                                  className="text-xs text-gray-500 hover:text-black transition-colors"
                                >
                                  답글
                                </button>
                              </div>

                              {nestedReplyTo?.commentId === comment.id && nestedReplyTo?.replyId === reply.id && (
                                <div className="ml-4 flex gap-1.5">
                                  <input
                                    type="text"
                                    value={nestedReplyInput}
                                    onChange={(e) => setNestedReplyInput(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && addNestedReply(comment.id, reply.id)}
                                    placeholder="답글 입력"
                                    className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black/10 min-w-0"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => addNestedReply(comment.id, reply.id)}
                                    className="rounded-lg bg-black text-white px-2 h-7 flex-shrink-0"
                                  >
                                    <Send className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {replyTo === comment.id && (
                      <div className="ml-4 flex gap-1.5">
                        <input
                          type="text"
                          value={replyInput}
                          onChange={(e) => setReplyInput(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && addReply(comment.id)}
                          placeholder="답글 입력"
                          className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black/10 min-w-0"
                        />
                        <Button
                          size="sm"
                          onClick={() => addReply(comment.id)}
                          className="rounded-lg bg-black text-white px-2 h-7 flex-shrink-0"
                        >
                          <Send className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
            </div>

            <div className="flex gap-1.5 pt-1">
              <input
                ref={commentInputRef}
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addComment()}
                placeholder="댓글 입력"
                className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black/10 min-w-0"
              />
              <Button size="sm" onClick={addComment} className="rounded-lg bg-black text-white px-2 h-7 flex-shrink-0">
                <Send className="w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </GlassCard>

      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-8 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <GlassCard className="flex flex-col max-h-full rounded-2xl">
              <div className="flex items-center justify-between p-3 border-b border-gray-200/50 rounded-t-2xl bg-white/95 backdrop-blur-sm flex-shrink-0">
                <h3 className="text-lg font-bold text-black">분석 상세</h3>
                <button
                  onClick={() => {
                    setShowDetail(false)
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="overflow-y-auto p-3 space-y-2 flex-1">
                <GlassCard className="p-3 text-center rounded-2xl">
                  <div className="text-4xl font-bold text-black mb-1">{analysis.overallScore}점</div>
                  <p className="text-xs text-gray-600">종합 평가</p>
                </GlassCard>

                <GlassCard className="p-2.5 space-y-1.5 rounded-2xl">
                  <div className="flex gap-2 border-b border-gray-200">
                    <button
                      onClick={() => setDetailTab("strengths")}
                      className={`flex-1 pb-1.5 text-sm font-semibold transition-colors ${
                        detailTab === "strengths"
                          ? "text-green-700 border-b-2 border-green-600"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      강점
                    </button>
                    <button
                      onClick={() => setDetailTab("improvements")}
                      className={`flex-1 pb-1.5 text-sm font-semibold transition-colors ${
                        detailTab === "improvements"
                          ? "text-orange-700 border-b-2 border-orange-600"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      보완
                    </button>
                  </div>
                  <ul className="space-y-1">
                    {detailTab === "strengths"
                      ? analysis.strengths.map((strength, idx) => (
                          <li key={idx} className="text-xs text-gray-700 leading-relaxed flex gap-2">
                            <span className="text-green-600 flex-shrink-0">•</span>
                            <span>{strength}.</span>
                          </li>
                        ))
                      : analysis.improvements.map((improvement, idx) => (
                          <li key={idx} className="text-xs text-gray-700 leading-relaxed flex gap-2">
                            <span className="text-orange-600 flex-shrink-0">•</span>
                            <span>{improvement}.</span>
                          </li>
                        ))}
                  </ul>
                </GlassCard>

                <Button
                  onClick={() => setShowDetail(false)}
                  className="w-full rounded-full bg-black hover:bg-gray-900 text-white h-10 text-sm font-medium"
                >
                  닫기
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </>
  )
}

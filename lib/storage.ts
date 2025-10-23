// 로컬 스토리지 관리
import type { Agent, UserInteraction, AnalysisResult } from "./types"

export class StorageManager {
  // 에이전트 저장
  static saveAgent(agent: Agent): void {
    const agents = this.getAllAgents()
    agents.push(agent)
    localStorage.setItem("huntfire_agents", JSON.stringify(agents))
  }

  // 모든 에이전트 가져오기
  static getAllAgents(): Agent[] {
    const data = localStorage.getItem("huntfire_agents")
    return data ? JSON.parse(data) : []
  }

  // 에이전트 업데이트
  static updateAgent(agentId: string, updates: Partial<Agent>): void {
    const agents = this.getAllAgents()
    const index = agents.findIndex((a) => a.id === agentId)
    if (index !== -1) {
      agents[index] = { ...agents[index], ...updates }
      localStorage.setItem("huntfire_agents", JSON.stringify(agents))
    }
  }

  // 사용자 상호작용 저장
  static saveInteraction(interaction: UserInteraction): void {
    localStorage.setItem(
      "huntfire_interaction",
      JSON.stringify({
        likedAgents: Array.from(interaction.likedAgents),
        savedAgents: Array.from(interaction.savedAgents),
        likedComments: Array.from(interaction.likedComments),
      }),
    )
  }

  // 사용자 상호작용 가져오기
  static getInteraction(): UserInteraction {
    const data = localStorage.getItem("huntfire_interaction")
    if (!data) {
      return {
        likedAgents: new Set(),
        savedAgents: new Set(),
        likedComments: new Set(),
      }
    }
    const parsed = JSON.parse(data)
    return {
      likedAgents: new Set(parsed.likedAgents || []),
      savedAgents: new Set(parsed.savedAgents || []),
      likedComments: new Set(parsed.likedComments || []),
    }
  }

  // 트렌딩 에이전트 계산
  static getTrendingAgents(): Agent[] {
    const agents = this.getAllAgents()
    const now = Date.now()
    const oneDayAgo = now - 24 * 60 * 60 * 1000

    return agents
      .filter((agent) => new Date(agent.createdAt).getTime() > oneDayAgo)
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 3) // 5개에서 3개로 변경
  }

  // 개인화 추천 알고리즘
  static getPersonalizedRecommendations(searchQuery: string): Agent[] {
    const agents = this.getAllAgents()
    const interaction = this.getInteraction()

    // 검색어와 매칭되는 에이전트 우선
    const scored = agents.map((agent) => {
      let score = 0

      // 검색어 매칭
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (agent.name.toLowerCase().includes(query)) score += 10
        if (agent.description.toLowerCase().includes(query)) score += 5
        if (agent.goal.toLowerCase().includes(query)) score += 3
      }

      // 인기도
      score += agent.likes * 2
      score += agent.saves * 3

      // 최신성
      const daysSinceCreation = (Date.now() - new Date(agent.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      score += Math.max(0, 10 - daysSinceCreation)

      return { agent, score }
    })

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((item) => item.agent)
  }

  static deleteAgent(agentId: string): void {
    const agents = this.getAllAgents()
    const filtered = agents.filter((a) => a.id !== agentId)
    localStorage.setItem("huntfire_agents", JSON.stringify(filtered))
  }

  static saveAsPrivate(agent: Agent): void {
    const updatedAgent = { ...agent, isPrivate: true }
    this.saveAgent(updatedAgent)
  }

  // 분석 결과 저장
  static saveAnalysis(analysis: AnalysisResult): void {
    const analyses = this.getAllAnalyses()
    analyses.push(analysis)
    localStorage.setItem("saenggibu_analyses", JSON.stringify(analyses))
  }

  // 모든 분석 결과 가져오기
  static getAllAnalyses(): AnalysisResult[] {
    const data = localStorage.getItem("saenggibu_analyses")
    return data ? JSON.parse(data) : []
  }

  static getUserAnalyses(userId: string): AnalysisResult[] {
    const allAnalyses = this.getAllAnalyses()
    return allAnalyses.filter((analysis) => analysis.userId === userId)
  }

  static getPublicAnalyses(): AnalysisResult[] {
    const allAnalyses = this.getAllAnalyses()
    return allAnalyses.filter((analysis) => !analysis.isPrivate)
  }

  static updateAnalysis(analysisId: string, updates: Partial<AnalysisResult>): void {
    const analyses = this.getAllAnalyses()
    const index = analyses.findIndex((a) => a.id === analysisId)
    if (index !== -1) {
      analyses[index] = { ...analyses[index], ...updates }
      localStorage.setItem("saenggibu_analyses", JSON.stringify(analyses))
    }
  }

  static getTrendingAnalyses(): AnalysisResult[] {
    const analyses = this.getPublicAnalyses()
    const now = Date.now()
    const oneDayAgo = now - 24 * 60 * 60 * 1000

    return analyses
      .filter((analysis) => new Date(analysis.uploadDate).getTime() > oneDayAgo)
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 3)
  }

  static getPersonalizedRecommendations(searchQuery: string): AnalysisResult[] {
    const analyses = this.getPublicAnalyses()
    const interaction = this.getInteraction()

    const scored = analyses.map((analysis) => {
      let score = 0

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (analysis.studentName.toLowerCase().includes(query)) score += 10
        if (analysis.strengths.some((s) => s.toLowerCase().includes(query))) score += 5
        if (analysis.improvements.some((i) => i.toLowerCase().includes(query))) score += 3
      }

      score += analysis.likes * 2
      score += analysis.saves * 3

      const daysSinceUpload = (Date.now() - new Date(analysis.uploadDate).getTime()) / (1000 * 60 * 60 * 24)
      score += Math.max(0, 10 - daysSinceUpload)

      return { analysis, score }
    })

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((item) => item.analysis)
  }
}

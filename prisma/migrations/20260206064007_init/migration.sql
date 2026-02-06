-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SPONSOR', 'PILOT', 'MANAGER', 'EXPERT', 'CITIZEN_DEV');

-- CreateEnum
CREATE TYPE "SOPStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'DEPRECATED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AgentType" AS ENUM ('ASSISTANT', 'SPECIALIST', 'ORCHESTRATOR', 'VALIDATOR');

-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'TESTING', 'DEPRECATED');

-- CreateEnum
CREATE TYPE "MUDAStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MUDAPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "CouncilRequestType" AS ENUM ('NEW_SOP', 'SOP_CHANGE', 'NEW_AGENT', 'PROCESS_CHANGE', 'BUDGET_REQUEST', 'OTHER');

-- CreateEnum
CREATE TYPE "CouncilRequestStatus" AS ENUM ('PENDING', 'VOTING', 'APPROVED', 'REJECTED', 'IMPLEMENTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "VoteDecision" AS ENUM ('APPROVE', 'REJECT', 'ABSTAIN');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "hashedPassword" TEXT,
    "image" TEXT,
    "emailVerified" TIMESTAMP(3),
    "role" "UserRole" NOT NULL DEFAULT 'CITIZEN_DEV',
    "organizationId" TEXT NOT NULL,
    "departmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "SOP" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "status" "SOPStatus" NOT NULL DEFAULT 'DRAFT',
    "purpose" TEXT,
    "scope" TEXT,
    "definitions" JSONB,
    "steps" JSONB,
    "kpis" JSONB,
    "owner" TEXT,
    "reviewer" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "organizationId" TEXT NOT NULL,
    "departmentId" TEXT,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SOP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SOPVersion" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "changelog" TEXT,
    "sopId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SOPVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "AgentType" NOT NULL DEFAULT 'ASSISTANT',
    "status" "AgentStatus" NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT,
    "masterPrompt" TEXT,
    "model" TEXT,
    "temperature" DOUBLE PRECISION,
    "tools" JSONB,
    "integrations" JSONB,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentSOPConnection" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "sopId" TEXT NOT NULL,
    "role" TEXT,

    CONSTRAINT "AgentSOPConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MUDAReport" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "MUDAStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "MUDAPriority" NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT,
    "currentState" TEXT,
    "proposedState" TEXT,
    "findings" JSONB,
    "recommendations" JSONB,
    "estimatedSavings" DOUBLE PRECISION,
    "savingsUnit" TEXT,
    "implementationCost" DOUBLE PRECISION,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MUDAReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValueChainMap" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "layout" JSONB,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ValueChainMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValueChainNode" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "positionX" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "positionY" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "style" JSONB,
    "data" JSONB,
    "mapId" TEXT NOT NULL,
    "sopId" TEXT,
    "agentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ValueChainNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValueChainEdge" (
    "id" TEXT NOT NULL,
    "type" TEXT,
    "label" TEXT,
    "mapId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "style" JSONB,

    CONSTRAINT "ValueChainEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouncilRequest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "CouncilRequestType" NOT NULL,
    "status" "CouncilRequestStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "MUDAPriority" NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT,
    "rationale" TEXT,
    "impact" TEXT,
    "votingDeadline" TIMESTAMP(3),
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CouncilRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouncilVote" (
    "id" TEXT NOT NULL,
    "decision" "VoteDecision" NOT NULL,
    "comment" TEXT,
    "requestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CouncilVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OntologyEntry" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "context" TEXT,
    "examples" JSONB,
    "relatedTerms" TEXT[],
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OntologyEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationalRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "raciMatrix" JSONB,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationalRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT,
    "size" INTEGER,
    "sopId" TEXT,
    "mudaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sopId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SOPTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SOPTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_slug_idx" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Department_organizationId_name_key" ON "Department"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "SOP_organizationId_idx" ON "SOP"("organizationId");

-- CreateIndex
CREATE INDEX "SOP_status_idx" ON "SOP"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SOP_organizationId_code_key" ON "SOP"("organizationId", "code");

-- CreateIndex
CREATE INDEX "SOPVersion_sopId_idx" ON "SOPVersion"("sopId");

-- CreateIndex
CREATE INDEX "Agent_organizationId_idx" ON "Agent"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_organizationId_code_key" ON "Agent"("organizationId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "AgentSOPConnection_agentId_sopId_key" ON "AgentSOPConnection"("agentId", "sopId");

-- CreateIndex
CREATE INDEX "MUDAReport_organizationId_idx" ON "MUDAReport"("organizationId");

-- CreateIndex
CREATE INDEX "MUDAReport_status_idx" ON "MUDAReport"("status");

-- CreateIndex
CREATE INDEX "ValueChainMap_organizationId_idx" ON "ValueChainMap"("organizationId");

-- CreateIndex
CREATE INDEX "ValueChainNode_mapId_idx" ON "ValueChainNode"("mapId");

-- CreateIndex
CREATE UNIQUE INDEX "ValueChainEdge_mapId_sourceId_targetId_key" ON "ValueChainEdge"("mapId", "sourceId", "targetId");

-- CreateIndex
CREATE INDEX "CouncilRequest_organizationId_idx" ON "CouncilRequest"("organizationId");

-- CreateIndex
CREATE INDEX "CouncilRequest_status_idx" ON "CouncilRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CouncilVote_requestId_userId_key" ON "CouncilVote"("requestId", "userId");

-- CreateIndex
CREATE INDEX "OntologyEntry_organizationId_idx" ON "OntologyEntry"("organizationId");

-- CreateIndex
CREATE INDEX "OntologyEntry_category_idx" ON "OntologyEntry"("category");

-- CreateIndex
CREATE UNIQUE INDEX "OntologyEntry_organizationId_term_key" ON "OntologyEntry"("organizationId", "term");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationalRole_organizationId_name_key" ON "OrganizationalRole"("organizationId", "name");

-- CreateIndex
CREATE INDEX "Comment_sopId_idx" ON "Comment"("sopId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "_SOPTags_B_index" ON "_SOPTags"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SOP" ADD CONSTRAINT "SOP_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SOP" ADD CONSTRAINT "SOP_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SOP" ADD CONSTRAINT "SOP_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SOP" ADD CONSTRAINT "SOP_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SOPVersion" ADD CONSTRAINT "SOPVersion_sopId_fkey" FOREIGN KEY ("sopId") REFERENCES "SOP"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentSOPConnection" ADD CONSTRAINT "AgentSOPConnection_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentSOPConnection" ADD CONSTRAINT "AgentSOPConnection_sopId_fkey" FOREIGN KEY ("sopId") REFERENCES "SOP"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MUDAReport" ADD CONSTRAINT "MUDAReport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MUDAReport" ADD CONSTRAINT "MUDAReport_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValueChainMap" ADD CONSTRAINT "ValueChainMap_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValueChainNode" ADD CONSTRAINT "ValueChainNode_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "ValueChainMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValueChainNode" ADD CONSTRAINT "ValueChainNode_sopId_fkey" FOREIGN KEY ("sopId") REFERENCES "SOP"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValueChainNode" ADD CONSTRAINT "ValueChainNode_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValueChainEdge" ADD CONSTRAINT "ValueChainEdge_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "ValueChainMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValueChainEdge" ADD CONSTRAINT "ValueChainEdge_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ValueChainNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValueChainEdge" ADD CONSTRAINT "ValueChainEdge_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "ValueChainNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouncilRequest" ADD CONSTRAINT "CouncilRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouncilRequest" ADD CONSTRAINT "CouncilRequest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouncilVote" ADD CONSTRAINT "CouncilVote_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "CouncilRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouncilVote" ADD CONSTRAINT "CouncilVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OntologyEntry" ADD CONSTRAINT "OntologyEntry_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationalRole" ADD CONSTRAINT "OrganizationalRole_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_sopId_fkey" FOREIGN KEY ("sopId") REFERENCES "SOP"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_mudaId_fkey" FOREIGN KEY ("mudaId") REFERENCES "MUDAReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_sopId_fkey" FOREIGN KEY ("sopId") REFERENCES "SOP"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SOPTags" ADD CONSTRAINT "_SOPTags_A_fkey" FOREIGN KEY ("A") REFERENCES "SOP"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SOPTags" ADD CONSTRAINT "_SOPTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

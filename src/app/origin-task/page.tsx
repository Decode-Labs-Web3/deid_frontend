"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { isAdmin } from "@/utils/session.utils";
import {
  Shield,
  Plus,
  Upload,
  Coins,
  Image as ImageIcon,
  Trophy,
  CheckCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskCard } from "@/components/cards/TaskCard";
import { IPFSLoadingAnimation, IPFSErrorAnimation } from "@/components/common";

interface TaskAttribute {
  trait_type: string;
  value: string | number;
}

interface BadgeDetails {
  badge_name: string;
  badge_description: string;
  badge_image: string;
  attributes: TaskAttribute[];
}

interface Task {
  id: string;
  task_title: string;
  task_description: string;
  validation_type: string;
  blockchain_network: string;
  token_contract_address: string;
  minimum_balance: number;
  badge_details: BadgeDetails;
  tx_hash?: string;
  block_number?: number;
  created_at: string;
}

const OriginTask = () => {
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [attributes, setAttributes] = useState<
    { trait_type: string; value: string }[]
  >([{ trait_type: "", value: "" }]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);

  useEffect(() => {
    setUserIsAdmin(isAdmin());
  }, []);

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setTasksLoading(true);
        setTasksError(null);

        console.log("🔍 Fetching tasks from API route...");
        const response = await fetch("/api/task?page=1&page_size=100");

        if (!response.ok) {
          throw new Error(`Failed to fetch tasks: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success && data.data) {
          console.log(`✅ Fetched ${data.data.length} tasks`);
          setTasks(data.data);
        } else {
          console.log("⚠️ No tasks found or error:", data.error);
          setTasks([]);
        }
      } catch (error) {
        console.error("❌ Error fetching tasks:", error);
        setTasksError(
          error instanceof Error ? error.message : "Failed to fetch tasks"
        );
        setTasks([]);
      } finally {
        setTasksLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const addAttribute = () => {
    setAttributes([...attributes, { trait_type: "", value: "" }]);
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-8 h-8 text-[#CA4A87]" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#CA4A87] to-[#b13e74] bg-clip-text text-transparent">
                Origin Tasks
              </h1>
            </div>
            <p className="text-muted-foreground">
              Complete tasks to earn exclusive badges and achievements
            </p>
          </div>

          {/* Admin Create Task Button */}
          {userIsAdmin && !showCreateTask && (
            <Button
              onClick={() => setShowCreateTask(true)}
              className="bg-gradient-to-r from-[#CA4A87] to-[#b13e74] hover:from-[#b13e74] hover:to-[#a0335f] text-white font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Task
            </Button>
          )}
        </div>

        {/* Create Task Form - Admin Only */}
        {userIsAdmin && showCreateTask && (
          <div className="bg-card border-2 border-[#CA4A87]/30 rounded-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-[#CA4A87]" />
                <h2 className="text-2xl font-bold">Create New Task</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateTask(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Task Information Section */}
              <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Coins className="w-5 h-5 text-[#CA4A87]" />
                  Task Information
                </h3>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Task Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., King of Ethereum"
                    className="border-border focus:border-[#CA4A87]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="e.g., Prove that you hold more than 1000 ETH"
                    rows={3}
                    className="border-border focus:border-[#CA4A87] resize-none"
                  />
                </div>

                {/* Validation Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Validation Type <span className="text-red-500">*</span>
                  </label>
                  <Select>
                    <SelectTrigger className="border-border focus:border-[#CA4A87]">
                      <SelectValue placeholder="Select validation type" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border shadow-lg">
                      <SelectItem value="erc20_balance">
                        <div className="flex flex-col items-start">
                          <span className="font-semibold">
                            ERC20 Balance Check
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Check if user holds minimum ERC20 token balance
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="erc721_owner">
                        <div className="flex flex-col items-start">
                          <span className="font-semibold">
                            ERC721 NFT Ownership
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Check if user owns NFT from collection
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Chain Selection & Token Address in Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Chain */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Blockchain Network <span className="text-red-500">*</span>
                    </label>
                    <Select>
                      <SelectTrigger className="border-border focus:border-[#CA4A87]">
                        <SelectValue placeholder="Select chain" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border shadow-lg">
                        <SelectItem value="ethereum">Ethereum</SelectItem>
                        <SelectItem value="bsc">BNB Smart Chain</SelectItem>
                        <SelectItem value="base">Base</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Token Address */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Token Contract Address{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="0x..."
                      className="border-border focus:border-[#CA4A87] font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Minimum Balance */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Minimum Balance / Requirement{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 1000"
                    className="border-border focus:border-[#CA4A87]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    For ERC20: Minimum token balance (without decimals). For
                    ERC721: Number of NFTs required
                  </p>
                </div>
              </div>

              {/* Badge Information Section */}
              <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#CA4A87]" />
                  Badge Details
                </h3>

                {/* Badge Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Badge Image <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-border hover:border-[#CA4A87] rounded-lg p-8 text-center cursor-pointer transition-colors group">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-[#CA4A87]/10 group-hover:bg-[#CA4A87]/20 flex items-center justify-center transition-colors">
                        <ImageIcon className="w-8 h-8 text-[#CA4A87]" />
                      </div>
                      <div>
                        <p className="font-medium">
                          Click to upload badge image
                        </p>
                        <p className="text-sm text-muted-foreground">
                          PNG, JPG, GIF up to 10MB (Recommended: 512x512px)
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 border-[#CA4A87] text-[#CA4A87] hover:bg-[#CA4A87] hover:text-white"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Select Image
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Badge Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Badge Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., Ethereum Whale Badge"
                    className="border-border focus:border-[#CA4A87]"
                  />
                </div>

                {/* Badge Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Badge Description <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Describe what this badge represents..."
                    rows={3}
                    className="border-border focus:border-[#CA4A87] resize-none"
                  />
                </div>

                {/* Badge Attributes */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium">
                      Badge Attributes
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addAttribute}
                      className="border-[#CA4A87] text-[#CA4A87] hover:bg-[#CA4A87] hover:text-white"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Attribute
                    </Button>
                  </div>

                  <div className="space-y-1 border border-border rounded-lg p-3">
                    {attributes.map((attr, index) => (
                      <div
                        key={index}
                        className="flex gap-3 items-start bg-background p-3 rounded-lg "
                      >
                        {/* Number Indicator */}
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#CA4A87]/10 text-[#CA4A87] font-semibold text-sm flex-shrink-0 mt-1">
                          {index + 1}
                        </div>

                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <Input
                            placeholder="Trait Type (e.g., Rarity)"
                            value={attr.trait_type}
                            onChange={(e) => {
                              const newAttrs = [...attributes];
                              newAttrs[index].trait_type = e.target.value;
                              setAttributes(newAttrs);
                            }}
                            className="border-border focus:border-[#CA4A87]"
                          />
                          <Input
                            placeholder="Value (e.g., Legendary)"
                            value={attr.value}
                            onChange={(e) => {
                              const newAttrs = [...attributes];
                              newAttrs[index].value = e.target.value;
                              setAttributes(newAttrs);
                            }}
                            className="border-border focus:border-[#CA4A87]"
                          />
                        </div>
                        {attributes.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttribute(index)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-muted-foreground mt-2">
                    Add metadata attributes to describe your badge (e.g.,
                    Rarity: Legendary, Type: Achievement, Tier: Gold)
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateTask(false)}
                >
                  Cancel
                </Button>
                <Button className="bg-gradient-to-r from-[#CA4A87] to-[#b13e74] hover:from-[#b13e74] hover:to-[#a0335f] text-white font-semibold">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Create Task & Badge
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tasks List */}
        {!showCreateTask && (
          <>
            {/* Loading State */}
            {tasksLoading && <IPFSLoadingAnimation />}

            {/* Error State */}
            {tasksError && !tasksLoading && (
              <IPFSErrorAnimation
                errorMessage={tasksError}
                onRetry={() => window.location.reload()}
              />
            )}

            {/* Tasks Grid */}
            {!tasksLoading && !tasksError && tasks.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    id={task.id}
                    task_title={task.task_title}
                    task_description={task.task_description}
                    validation_type={task.validation_type}
                    blockchain_network={task.blockchain_network}
                    token_contract_address={task.token_contract_address}
                    minimum_balance={task.minimum_balance}
                    badge_details={task.badge_details}
                    tx_hash={task.tx_hash}
                    block_number={task.block_number}
                    created_at={task.created_at}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!tasksLoading && !tasksError && tasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Trophy className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Tasks Yet</h3>
                <p className="text-muted-foreground max-w-md">
                  {userIsAdmin
                    ? "Create your first task to get started!"
                    : "Origin tasks are coming soon! Check back later to complete challenges and earn exclusive badges."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default OriginTask;

import { Currency } from "app/bungie/services/destiny/shared.interface";
import { InventoryItem, InventoryItemStatsBase } from "app/bungie/services/interface.barrel";

export interface ICharacterInventorySummary {
  inventory: Inventory;
  character: Character;
  progressions: Progressions2;
  activities: Activities;
  equipment: Equipment;
  itemComponents: ItemComponents;
}

interface ItemComponents {
  instances: Instances;
  objectives: Objectives;
  perks: Perks;
  sockets: Sockets;
  talentGrids: TalentGrids;
  plugStates: PlugStates;
  stats: any;
}

interface Instances {
  data: { [key: number]: InventoryItemStatsBase[] };
  privacy: number;
}

interface Inventory {
  data: Data;
  privacy: number;
}

interface Data {
  items: InventoryItem[];
}

interface PlugStates {
  data: any;
  privacy: number;
}

interface TalentGrids {
  data: any;
  privacy: number;
}


interface Node {
  nodeIndex: number;
  nodeHash: number;
  state: number;
  isActivated: boolean;
  stepIndex: number;
  materialsToUpgrade: MaterialsToUpgrade[];
  activationGridLevel: number;
  progressPercent: number;
  hidden: boolean;
}

interface MaterialsToUpgrade {
  itemHash: number;
  deleteOnAction: boolean;
  count: number;
  omitFromRequirements: boolean;
}

interface Sockets {
  data: any;
  privacy: number;
}


interface Socket {
  plugHash: number;
  isEnabled: boolean;
  reusablePlugHashes: number[];
}

interface Perks {
  data: any;
  privacy: number;
}


interface Perk {
  perkHash: number;
  iconPath: string;
  isActive: boolean;
  visible: boolean;
}

interface Objectives {
  data: any;
  privacy: number;
}

interface Equipment {
  data: Data5;
  privacy: number;
}

interface Data5 {
  items: InventoryItem[];
}

interface Activities {
  data: Data4;
  privacy: number;
}

interface Data4 {
  dateActivityStarted: string;
  availableActivities: AvailableActivity[];
  currentActivityHash: number;
  currentActivityModeHash: number;
  lastCompletedStoryHash: number;
}

interface AvailableActivity {
  activityHash: number;
  isNew: boolean;
  canLead: boolean;
  canJoin: boolean;
  isCompleted: boolean;
  isVisible: boolean;
  recommendedLight: number;
  difficultyTier: number;
}

interface Progressions2 {
  data: Data3;
  privacy: number;
}

interface Data3 {
  progressions: Progressions;
  factions: any;
  milestones: any;
  quests: any[];
  uninstancedItemObjectives: any;
}

interface Reward {
  rewardCategoryHash: number;
  entries: Entry[];
}

interface Entry {
  rewardEntryHash: number;
  earned: boolean;
  redeemed: boolean;
}

interface AvailableQuest {
  questItemHash: number;
  status: Status;
}

interface AvailableQuest2 {
  questItemHash: number;
  status: Status2;
}

interface AvailableQuest3 {
  questItemHash: number;
  status: Status;
  activity: Activity;
}

interface AvailableQuest4 {
  questItemHash: number;
  status: Status;
  activity: Activity2;
}

interface Activity2 {
  activityHash: number;
  variants: Variant[];
}

interface _2171429505 {
  milestoneHash: number;
  availableQuests: AvailableQuest3[];
  startDate: string;
  endDate: string;
}

interface Activity {
  activityHash: number;
  modifierHashes: number[];
  variants: Variant[];
}

interface Variant {
  activityHash: number;
}

interface Status2 {
  questHash: number;
  stepHash: number;
  stepObjectives: StepObjective[];
  tracked: boolean;
  itemInstanceId: string;
  completed: boolean;
  redeemed: boolean;
  started: boolean;
}

interface StepObjective {
  objectiveHash: number;
  destinationHash: number;
  activityHash: number;
  progress: number;
  complete: boolean;
}

interface Status {
  questHash: number;
  stepHash: number;
  stepObjectives: any[];
  tracked: boolean;
  itemInstanceId: string;
  completed: boolean;
  redeemed: boolean;
  started: boolean;
}

interface Progressions {
  '540048094': LevelProgression;
  '1716568313': LevelProgression;
  '2030054750': LevelProgression;
  '2424694449': LevelProgression;
  '3298204156': LevelProgression;
  '3455936608': LevelProgression;
}

interface Character {
  data: Data2;
  privacy: number;
}

interface Data2 {
  membershipId: string;
  membershipType: number;
  characterId: string;
  dateLastPlayed: string;
  minutesPlayedThisSession: string;
  minutesPlayedTotal: string;
  light: number;
  stats: any;
  raceHash: number;
  genderHash: number;
  classHash: number;
  raceType: number;
  classType: number;
  genderType: number;
  emblemPath: string;
  emblemBackgroundPath: string;
  emblemHash: number;
  levelProgression: LevelProgression;
  baseCharacterLevel: number;
  percentToNextLevel: number;
}

interface LevelProgression {
  progressionHash: number;
  dailyProgress: number;
  dailyLimit: number;
  weeklyProgress: number;
  weeklyLimit: number;
  currentProgress: number;
  level: number;
  levelCap: number;
  stepIndex: number;
  progressToNextLevel: number;
  nextLevelAt: number;
}

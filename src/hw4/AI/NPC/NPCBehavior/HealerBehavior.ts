import NPCActor from "../../../Actors/NPCActor";
import NPCBehavior from "../NPCBehavior";
import GoalReached from "../NPCStatuses/FalseStatus";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import Idle from "../NPCActions/GotoAction";
import { TargetExists } from "../NPCStatuses/TargetExists";
import BasicFinder from "../../../GameSystems/Searching/BasicFinder";
import { ClosestPositioned, LowestHealthBattler } from "../../../GameSystems/Searching/HW4Reducers";
import { AllyFilter, BattlerActiveFilter, BattlerGroupFilter, BattlerHealthFilter, ItemFilter, RangeFilter, VisibleItemFilter } from "../../../GameSystems/Searching/HW4Filters";
import PickupItem from "../NPCActions/PickupItem";
import UseHealthpack from "../NPCActions/UseHealthpack";
import Healthpack from "../../../GameSystems/ItemSystem/Items/Healthpack";
import Item from "../../../GameSystems/ItemSystem/Item";
import { HasItem } from "../NPCStatuses/HasItem";
import FalseStatus from "../NPCStatuses/FalseStatus";
import Battler from "../../../GameSystems/BattleSystem/Battler";


/**
 * When an NPC is acting as a healer, their goal is to try and heal it's teammates by running around, picking up healthpacks, 
 * bringing to the healthpacks to their allies and healing them.
 */
export default class HealerBehavior extends NPCBehavior  {

    /** The GameNode that owns this NPCGoapAI */
    protected override owner: NPCActor;
    
    /** Initialize the NPC AI */
    public initializeAI(owner: NPCActor, opts: Record<string, any>): void {
        super.initializeAI(owner, opts);

        let scene = owner.getScene();

        /* ######### Add all healer statuses ######## */

        this.addStatus(HealerStatuses.GOAL, new FalseStatus());

        // Check if a healthpack exists in the scene and it's visible
        this.addStatus(HealerStatuses.HPACK_EXISTS, new TargetExists(scene.getHealthpacks(), new BasicFinder<Item>(null, ItemFilter(Healthpack), VisibleItemFilter())));

        // Check if a healthpack exists in the actors inventory
        this.addStatus(HealerStatuses.HAS_HPACK, new HasItem(owner, new BasicFinder<Item>(null, ItemFilter(Healthpack))));

        // Check if a lowhealth ally exists in the scene
        let lowhealthAlly = new BasicFinder<Battler>(null, BattlerActiveFilter(), BattlerGroupFilter([owner.battleGroup]));
        this.addStatus(HealerStatuses.ALLY_EXISTS, new TargetExists(scene.getBattlers(), lowhealthAlly));
        
        /* ######### Add all healer actions ######## */

        // TODO configure the rest of the healer actions

        // Pickup closest health pack
        let pickup = new PickupItem(this, this.owner);
        pickup.targets = scene.getHealthpacks();
        pickup.targetFinder = new BasicFinder<Item>(ClosestPositioned(this.owner), VisibleItemFilter(), ItemFilter(Healthpack));
        pickup.addPrecondition(HealerStatuses.HPACK_EXISTS);
        pickup.addEffect(HealerStatuses.HAS_HPACK);
        pickup.cost = 5;
        this.addState(HealerActions.PICKUP_HPACK, pickup);

        // let enemyBattlerFinder = new BasicFinder<Battler>(null, BattlerActiveFilter(), EnemyFilter(this.owner), RangeFilter(this.target, 0, this.range*this.range))

        // Use health pack on lowest health ally
        let useHealth = new UseHealthpack(this, this.owner);
        useHealth.targets = scene.getBattlers();
        useHealth.targetFinder = new BasicFinder<Battler>(LowestHealthBattler, BattlerActiveFilter(), AllyFilter(this.owner), BattlerHealthFilter(0, 5));
        useHealth.addPrecondition(HealerStatuses.ALLY_EXISTS);
        useHealth.addPrecondition(HealerStatuses.HAS_HPACK);
        useHealth.addEffect(HealerStatuses.GOAL);
        useHealth.cost = 1;
        this.addState(HealerActions.USE_HPACK, useHealth);

        // Idle action
        let idle = new Idle(this, this.owner);
        idle.addEffect(HealerStatuses.GOAL);
        idle.cost = 1000;
        this.addState(HealerActions.IDLE, idle);

        /* ######### Set the healers goal ######## */

        this.goal = HealerStatuses.GOAL;
        this.initialize();
    }

    public override handleEvent(event: GameEvent): void {
        switch(event.type) {
            default: {
                super.handleEvent(event);
                break;
            }
        }
    }

    public override update(deltaT: number): void {
        super.update(deltaT);
    }

}

// World states for the healer
const HealerStatuses = {

    // Whether or not a healthpack exists in the world
    HPACK_EXISTS: "hpack-exists",

    // Whether the healer has a healthpack in their inventory or not
    ALLY_EXISTS: "ally-exists",

    // Whether the healer has any allies in the game world or not
    HAS_HPACK: "has-hpack",

    // Whether the healer has reached it's goal or not
    GOAL: "goal"

} as const

// Healer actions
const HealerActions = {

    PICKUP_HPACK: "pickup-hpack",

    USE_HPACK: "use-hpack",

    IDLE: "idle",

} as const;


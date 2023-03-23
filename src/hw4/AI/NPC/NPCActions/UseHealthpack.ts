import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import Battler from "../../../GameSystems/BattleSystem/Battler";
import Healthpack from "../../../GameSystems/ItemSystem/Items/Healthpack";
import { TargetableEntity } from "../../../GameSystems/Targeting/TargetableEntity";
import NPCActor from "../../../Actors/NPCActor";
import NPCBehavior from "../NPCBehavior";
import NPCAction from "./NPCAction";
import Finder from "../../../GameSystems/Searching/Finder";


export default class UseHealthpack extends NPCAction {
    
    // The targeting strategy used for this GotoAction - determines how the target is selected basically
    protected override _targetFinder: Finder<Battler>;
    // The targets or Targetable entities 
    protected override _targets: Battler[];
    // The target we are going to set the actor to target
    protected override _target: Battler | null;

    public constructor(parent: NPCBehavior, actor: NPCActor) { 
        super(parent, actor);
    }

    public performAction(target: Battler): void {
        // if(!target) {
        //     console.log("Invalid target");
        //     this.finished();
        //     return;
        // }
        
        // Assuming there is a healthpack in the inventory
        // let item = this.actor.inventory.find((item) => {
        //     return item instanceof Healthpack;
        // }) as Healthpack;
        
        // if(!item) {
        //     console.log("Invalid item");
        //     this.finished();
        //     return;
        // }
        
        // this.actor.inventory.remove(item.id);
        // target.health = target.health + item.health;

        this.finished();
    }

}
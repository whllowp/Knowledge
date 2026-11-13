/**
 * tutorial.js — first-run onboarding.
 *
 * A short ordered checklist that watches the game's own events rather than
 * scripting the player: walk to water, cast, strike, land a fish, open the
 * shop. Each step can carry a world-space marker so the objective is visible
 * in 3D as well as in the HUD.
 */
import * as THREE from 'three';
import { Emitter, dist2 } from '../core/util.js';

export const STEPS = [
  {
    id: 'reach_water',
    title: '走到水边',
    hint: 'WASD 移动，Shift 奔跑。跟着蓝色光柱到湖畔栈桥。',
    marker: true,
  },
  {
    id: 'first_cast',
    title: '抛出第一竿',
    hint: '按住 F 蓄力，松开抛竿。右下角的力度条越满，抛得越远。',
  },
  {
    id: 'first_bite',
    title: '抓住咬钩时机',
    hint: '浮漂沉下去、屏幕出现「！」时，立刻按鼠标左键提竿。',
  },
  {
    id: 'first_catch',
    title: '把鱼拉上岸',
    hint: '中鱼后按住左键收线，让白线保持在绿色区域里，别让鱼线崩断。',
  },
  {
    id: 'first_shop',
    title: '升级你的装备',
    hint: '按 Tab 打开商店，用金币买一根更好的鱼竿或更结实的鱼线。',
  },
  {
    id: 'first_view',
    title: '切换视角',
    hint: '按 V 在第一人称与第三人称之间切换。',
  },
];

export class Tutorial extends Emitter {
  constructor(game) {
    super();
    this.game = game;
    this.index = 0;
    this.active = !game.profile.settings.tutorialDone;
    this.done = false;
    this._marker = null;
    this._markerTarget = new THREE.Vector3();
    this._pulse = 0;
    this.build();
  }

  get step() {
    return STEPS[this.index] || null;
  }

  get total() {
    return STEPS.length;
  }

  /** Start (or restart) the tutorial. */
  start() {
    this.index = 0;
    this.active = true;
    this.done = false;
    this.emit('start');
    this._announce();
  }

  skip() {
    this.active = false;
    this.done = true;
    this.game.profile.settings.tutorialDone = true;
    this._hideMarker();
    this.emit('skip');
  }

  complete() {
    if (!this.active) return;
    const step = this.step;
    this.index++;
    this.emit('step', { id: step?.id, index: this.index });
    if (this.index >= STEPS.length) {
      this.active = false;
      this.done = true;
      this.game.profile.settings.tutorialDone = true;
      this._hideMarker();
      this.game.profile.coins += 500;
      this.game.hud.showToast('教学完成！', '奖励 500 金币 · 现在开始自由探索吧');
      this.game.audio.play('achieve');
      this.emit('complete');
      return;
    }
    this.game.audio.play('ui_tab');
    this._announce();
  }

  _announce() {
    const s = this.step;
    if (!s) return;
    this.game.hud.showToast(`教学 ${this.index + 1}/${STEPS.length}：${s.title}`, s.hint, 5.5);
  }

  _hideMarker() {
    if (this._marker) this._marker.visible = false;
  }

  build() {
    const g = new THREE.Group();
    g.name = 'tutorial-marker';
    const beamMat = new THREE.MeshBasicMaterial({ color: 0x7fd8ff, transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 26, 12, 1, true), beamMat);
    beam.position.y = 13;
    g.add(beam);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x7fd8ff, transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.6, 2.0, 28), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.12;
    g.add(ring);
    g.visible = false;
    this._marker = g;
    this._beamMat = beamMat;
    this._ringMat = ringMat;
    this.game.engine.worldGroup.add(g);
  }

  update(dt, ctx) {
    if (!this.active) return;
    const { player, world, profile } = ctx;
    const s = this.step;
    if (!s) return;

    // ---- marker: point at the nearest unlocked spot for the first step
    if (s.marker) {
      const spot = world.activeSpot(player.position.x, player.position.z, profile.level) || world.nearestSpot(player.position.x, player.position.z);
      if (spot) {
        this._markerTarget.set(spot.x, world.heightAt(spot.x, spot.z), spot.z);
        this._marker.visible = true;
        this._marker.position.copy(this._markerTarget);
        this._pulse += dt;
        const k = 0.75 + Math.sin(this._pulse * 3.2) * 0.25;
        this._beamMat.opacity = 0.16 + k * 0.16;
        this._ringMat.opacity = 0.5 + k * 0.35;
        this._marker.scale.setScalar(0.9 + k * 0.12);
        // step complete once we are inside the spot
        if (dist2(player.position.x, player.position.z, spot.x, spot.z) < Math.max(8, spot.radius)) {
          this.complete();
        }
      }
    } else {
      this._hideMarker();
    }

    switch (s.id) {
      case 'first_cast':
        if (ctx.fishing.state !== 'idle') this.complete();
        break;
      case 'first_bite':
        if (ctx.fishing.state === 'bite' || ctx.fishing.state === 'fight') this.complete();
        break;
      case 'first_catch':
        if ((profile.stats.catches || 0) >= 1) this.complete();
        break;
      case 'first_shop':
        if (ctx.panelsOpen && ctx.panelTab === 'shop') this.complete();
        break;
      case 'first_view':
        if (this._viewToggled) this.complete();
        break;
      default:
        break;
    }
  }

  /** Called by the game when the player toggles the camera. */
  notifyViewToggle() {
    if (this.active && this.step?.id === 'first_view') this._viewToggled = true;
  }

  dispose() {
    this.game.engine.worldGroup.remove(this._marker);
    this._marker?.traverse((o) => {
      o.geometry?.dispose?.();
      o.material?.dispose?.();
    });
    this.clear();
  }
}

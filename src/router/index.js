import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import MedicationsView from "../views/MedicationsView.vue";
import DrainsView from "../views/DrainsView.vue";
import DrainSideView from "../views/DrainSideView.vue";
import DrainSummaryView from "../views/DrainSummaryView.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: HomeView },
    { path: "/medications", name: "medications", component: MedicationsView },
    { path: "/drains", name: "drains", component: DrainsView },
    { path: "/drains/summary", name: "drain-summary", component: DrainSummaryView },
    { path: "/drains/:side(left|right)", name: "drain-side", component: DrainSideView, props: true }
  ],
  scrollBehavior() {
    return { top: 0 };
  }
});

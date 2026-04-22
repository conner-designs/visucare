import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import MedicationsView from "../views/MedicationsView.vue";
import DrainsView from "../views/DrainsView.vue";
import DrainSideView from "../views/DrainSideView.vue";
import DrainSummaryView from "../views/DrainSummaryView.vue";
import DrainEntryDetailView from "../views/DrainEntryDetailView.vue";

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", alias: "/index.html", name: "home", component: HomeView },
    { path: "/medications", name: "medications", component: MedicationsView },
    { path: "/drains", name: "drains", component: DrainsView },
    { path: "/drains/summary", name: "drain-summary", component: DrainSummaryView },
    { path: "/drains/summary/:entryId", name: "drain-entry-detail", component: DrainEntryDetailView, props: true },
    { path: "/drains/:side(left|right)", name: "drain-side", component: DrainSideView, props: true }
  ],
  scrollBehavior() {
    return { top: 0 };
  }
});

import { defineStore } from 'pinia';
import { listDistricts } from '@/api/baseinfo/districts'; // 假设这是你的API方法

const useDistrictsStore = defineStore('districts', {
  state: () => ({
    districts: [], // 用于存储行政区划数据
  }),

  actions: {
    async fetchDistricts() {
      try {
        const response = await listDistricts({"pageNum":1, "pageSize": 1000}); // 假设这是你的API调用
        this.districts = response.rows; // 将API返回的数据赋值给 districts
      } catch (error) {
        console.error('Failed to fetch districts:', error);
      }
    },
  },

  getters: {
    // 可以在这里定义一些 getter，例如获取特定级别的行政区划等
    getDistrictsByPCode() {
      console.log("getDistrictsByPCode-----------------", this.districts)
      return (pCode) => {
        return this.districts.filter(district => district.pCode === pCode);
      };
    },
  },
});

export default useDistrictsStore;
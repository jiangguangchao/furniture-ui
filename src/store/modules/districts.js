import { defineStore } from 'pinia';
import { listDistricts } from '@/api/baseinfo/districts'; // 假设这是你的API方法

const useDistrictsStore = defineStore('districts', {
  state: () => ({
    districts: [], // 用于存储行政区划数据
    isFetching: false, // 新增标志位，用于判断是否正在或已经请求数据
  }),

  actions: {
    async fetchDistricts() {
      if (this.isFetching) return; // 如果已经在请求数据，则直接返回
      this.isFetching = true; // 设置标志位为true，表示正在请求数据
      try {
        const response = await listDistricts({"pageNum":1, "pageSize": 1000});
        this.districts = response.rows; // 将API返回的数据赋值给 districts
      } catch (error) {
        console.error('Failed to fetch districts:', error);
      } finally {
        this.isFetching = false; // 请求完成后，将标志位设置为false
      }
    },
  },

  getters: {
    // 可以在这里定义一些 getter，例如获取特定级别的行政区划等
    getDistrictsByPCode() {
      return (pCode) => {
        return this.districts.filter(district => district.pCode === pCode);
      };
    },

    getNameByCode() {
      return (code) => {
        if (this.districts.length < 1) {
          this.fetchDistricts();
        }
        const district = this.districts.find(district => district.code === code);
        return district ? district.name : '';
      };
    },
  },
});

export default useDistrictsStore;
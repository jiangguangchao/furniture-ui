<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="供货商" prop="supplier">
        <el-input
          v-model="queryParams.supplier"
          placeholder="请输入供货商"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="日期" style="width: 308px">
        <el-date-picker
          v-model="daterangePurchaseDate"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="到货状态" prop="arrivalStatus">
        <el-select v-model="queryParams.arrivalStatus" placeholder="请选择到货状态" style="width: 100px" clearable>
          <el-option
            v-for="dict in purchase_arrival_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="家具类别" prop="furnitureCategory">
        <el-select v-model="queryParams.furnitureCategory" placeholder="请选择家具类别" style="width: 100px" clearable>
          <el-option
            v-for="dict in furniture_category"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['purchase:purchaseOrder:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['purchase:purchaseOrder:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['purchase:purchaseOrder:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['purchase:purchaseOrder:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table 
      v-loading="loading" 
      :data="purchaseOrderList" 
      @selection-change="handleSelectionChange"
      :row-class-name="tableRowClassName"
    >
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="供货方" align="center" prop="supplier" />
      <el-table-column label="家具类别" align="center" prop="furnitureCategory">
        <template #default="scope">
          <span>{{ parseFurnitureCategory(scope.row.furnitureCategory) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订货日期" align="center" prop="purchaseDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.purchaseDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="到货状态" align="center" prop="arrivalStatus">
        <template #default="scope">
          <dict-tag :options="purchase_arrival_status" :value="scope.row.arrivalStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="物流" align="center" prop="logistics">
        <template #default="scope">
          <dict-tag :options="purchase_logistics" :value="scope.row.logistics"/>
        </template>
      </el-table-column>
      <el-table-column label="物流费" align="center" prop="logisticsMoney" />
      <!-- <el-table-column label="手机" align="center" prop="phone" />
      <el-table-column label="微信" align="center" prop="weichat" /> -->
      <el-table-column label="已支付金额" align="center" prop="paidMoney" />
      <el-table-column label="总金额" align="center" prop="totalAmount" />
      <el-table-column label="备注" align="center" prop="remarks" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <!-- <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['purchase:purchaseOrder:edit']">修改</el-button> -->
          <!-- <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['purchase:purchaseOrder:remove']">删除</el-button> -->
          <el-button link type="primary" icon="Delete" @click="handleDetail(scope.row)" v-hasPermi="['purchase:purchaseOrder:list']">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!--新增-->
    <el-dialog :title="title" :inline="true" v-model="open" width="700px" append-to-body>
      <purchaseOrderEdit />
    </el-dialog>

  

  <el-dialog title="详情" v-model="detailOpen" width="850px" append-to-body>
    <detailTab :purchaseOrder="currentPurchaseOrder"></detailTab>
  </el-dialog>

  </div>
</template>

<script setup name="PurchaseOrder">
import { listPurchaseOrder, getPurchaseOrder, delPurchaseOrder, addPurchaseOrder, updatePurchaseOrder } from "@/api/purchase/purchaseOrder";
import detailTab from "./detailTab.vue"
import { parseTime } from "@/utils/ruoyi";
import purchaseOrderEdit from "./purchaseOrderEdit.vue";
import { eventBus } from "@/utils/eventBus";

const { proxy } = getCurrentInstance();
const { purchase_arrival_status } = proxy.useDict('purchase_arrival_status');
const { purchase_logistics } = proxy.useDict('purchase_logistics');
const { furniture_category } = proxy.useDict('furniture_category');

const purchaseOrderList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const daterangePurchaseDate = ref([]);
const filePathList = ref([]);
const currentPurchaseOrder = ref({});
const detailOpen = ref(false);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    purchaseDate: null,
    arrivalStatus: null,
  },
  rules: {
    supplier: [
      { required: true, message: "供货方不能为空", trigger: "blur" }
    ],
    purchaseDate: [
      { required: true, message: "日期不能为空", trigger: "blur" }
    ],
    arrivalStatus: [
      { required: true, message: "到货状态不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询进货单列表 */
function getList() {
  loading.value = true;
  queryParams.value.params = {};
  if (null != daterangePurchaseDate && '' != daterangePurchaseDate) {
    queryParams.value.params["beginPurchaseDate"] = daterangePurchaseDate.value[0];
    queryParams.value.params["endPurchaseDate"] = daterangePurchaseDate.value[1];
  }
  listPurchaseOrder(queryParams.value).then(response => {
    purchaseOrderList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    supplier: null,
    purchaseDate: parseTime(new Date()),
    arrivalStatus: '0',
    phone: null,
    weichat: null,
    orderList: null,
    totalAmount: null,
    goodsList: [],
    remarks: null,
    uploadFiles: []
  };
  proxy.resetForm("purchaseOrderRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  daterangePurchaseDate.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加进货单";
}


/** 提交按钮 */
function submitForm() {
  proxy.$refs["purchaseOrderRef"].validate(valid => {
    if (valid) {

      if (form.value.id != null) {
        //修改提交时不需要传uploadFiles，因为文件上传时已经绑定到了当前记录。
        //如果这里不清空，会导致当前记录关联的文件上传记录重复
        form.value.uploadFiles = [];
        updatePurchaseOrder(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addPurchaseOrder(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

function handleDetail(row) {
  console.log("handleDetail row: ", row);
  currentPurchaseOrder.value = row;
  detailOpen.value = true;
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除进货单编号为"' + _ids + '"的数据项？').then(function() {
    return delPurchaseOrder(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('purchase/purchaseOrder/export', {
    ...queryParams.value
  }, `purchaseOrder_${new Date().getTime()}.xlsx`)
}

/** 根据到货状态设置表格行背景颜色 */
function tableRowClassName({ row }) {
  if (row.arrivalStatus === '0') {
    return 'row-status-0'; // 未到货
  } else if (row.arrivalStatus === '1') {
    return 'row-status-1'; // 部分到货
  } else if (row.arrivalStatus === '2') {
    return 'row-status-2'; // 全部到货
  } else if (row.arrivalStatus === '3') {
    return 'row-status-3'; // 发货中
  }
  return '';
}

function handleUpload(fileList){
  if (!fileList || fileList.length == 0) {
    return;
  }

  if (!form.value.uploadFiles) {
    form.value.uploadFiles = [];
  }
  fileList.forEach(file => {
    if (file) {
      form.value.uploadFiles.push({id:file.id});
    }
  });
  
}

function parseFurnitureCategory(furnitureCategorys) {
  if (!furnitureCategorys || furnitureCategorys.length === 0) {
    return '';
  }

  // 将 furnitureCategorys 字符串按逗号分割成数组
  const categoryIds = furnitureCategorys.split(',');

  // 使用 furniture_category.value 数组查找对应的 label
  const categoryNames = categoryIds.map(id => {
    const category = furniture_category.value.find(cat => cat.value === id);
    return category ? category.label : '';
  });

  // 将类别名称数组用逗号连接成字符串
  return categoryNames.join(',');
}

function getFileId(path) {
  // 找到最后一个斜杠的位置
  const lastSlashIndex = path.lastIndexOf('/');//furniture_category
  // 提取从最后一个斜杠之后的部分
  const fileNameWithExtension = path.substring(lastSlashIndex + 1);
  // 去除后缀名
  const fileNameWithoutExtension = fileNameWithExtension.split('.')[0];
  return fileNameWithoutExtension;
}

onMounted(() => {
  eventBus.on('PO:orderUpdated', getList);
});

onUnmounted(() => {
  eventBus.off('PO:orderUpdated', getList);
});

getList();
</script>

<style>
.el-table .row-status-0 {
  background-color: #f89898; /* 未到货 - 红色背景 */
}

.el-table .row-status-1 {
  background-color: #fcd3d3; /* 部分到货 - 橙色背景 */
}

.el-table .row-status-2 {
  background-color: #95d475; /* 全部到货 - 绿色背景 */
}

.el-table .row-status-3 {
  background-color: #c6e2ff; /* 发货中 - 蓝色背景 */
}
</style>
---
title: "Java Stream API 学习总结｜刚学完，热乎的知识点都在这了"
published: 2026-02-20
description: "梳理 Java Stream 的创建方式、中间与终止操作、Collectors、并行流和常见使用陷阱。"
tags: ["Java","Stream API","学习笔记"]
category: "Java"
lang: "zh_CN"
author: "小衰"
comment: false
---

最近花了一周时间系统学习了 Java Stream API，从一开始的"这啥玩意儿"到现在的"真香"，中间踩了不少坑。

想着趁热打铁，把知识点梳理一遍，**既是对自己的总结，也能帮到正在学 Stream 的你**。

本文不包含复杂的项目实战，就是纯粹的知识点总结，适合：

-   刚学完 Stream 需要复习的同学
-   工作中想快速查阅用法的开发者
-   面试前想巩固基础的朋友

* * *

## 一、Stream 到底是什么？

先说结论：**Stream 不是容器，不存储数据，它只是数据源的"视图"** 。

### 1.1 对比传统写法

java

编辑

```
//  传统命令式写法
List<String> result = new ArrayList<>();
for (String s : list) {
    if (s.length() > 3) {
        result.add(s.toUpperCase());
    }
}

//  Stream 声明式写法
List<String> result = list.stream()
    .filter(s -> s.length() > 3)
    .map(String::toUpperCase)
    .collect(Collectors.toList());
```

### 1.2 三大核心特性

表格

| 特性         | 说明                    |
| ---------- | --------------------- |
| **不存储数据**  | Stream 只是数据源的视图，不持有数据 |
| **不修改源数据** | 函数式不可变，原集合不会被修改       |
| **延迟执行**   | 中间操作惰性求值，终止操作才触发执行    |

* * *

## 二、Stream 的创建方式

### 2.1 从集合创建

java

编辑

```
List<String> list = Arrays.asList("a", "b", "c");

// 串行流
Stream<String> stream = list.stream();

// 并行流（多线程处理）
Stream<String> parallelStream = list.parallelStream();
```

### 2.2 从数组创建

java

编辑

```
String[] array = {"a", "b", "c"};
Stream<String> stream = Arrays.stream(array);
```

### 2.3 从值创建

java

编辑

```
Stream<String> stream = Stream.of("a", "b", "c");
```

### 2.4 从迭代/生成创建

java

编辑

```
// 迭代（无限流，需要 limit 限制）
Stream<Integer> iterate = Stream.iterate(0, n -> n + 1);

// 生成（无限流）
Stream<Double> generate = Stream.generate(Math::random);

// 范围
IntStream range = IntStream.range(1, 10);      // 1-9
IntStream rangeClosed = IntStream.rangeClosed(1, 10);  // 1-10
```

* * *

## 三、核心操作分类

### 3.1 中间操作（返回 Stream，可链式调用）

表格

| 操作         | 说明   | 代码示例                                 |
| ---------- | ---- | ------------------------------------ |
| `filter`   | 过滤   | `.filter(n -> n > 5)`                |
| `map`      | 元素转换 | `.map(String::length)`               |
| `flatMap`  | 扁平化  | `.flatMap(Collection::stream)`       |
| `distinct` | 去重   | `.distinct()`                        |
| `sorted`   | 排序   | `.sorted(Comparator.naturalOrder())` |
| `limit`    | 截断   | `.limit(10)`                         |
| `skip`     | 跳过   | `.skip(5)`                           |
| `peek`     | 调试   | `.peek(System.out::println)`         |

### 3.2 终止操作（返回结果，触发执行）

表格

| 操作          | 说明   | 代码示例                              |
| ----------- | ---- | --------------------------------- |
| `collect`   | 收集   | `.collect(Collectors.toList())`   |
| `forEach`   | 遍历   | `.forEach(System.out::println)`   |
| `count`     | 计数   | `.count()`                        |
| `reduce`    | 归约   | `.reduce(0, Integer::sum)`        |
| `anyMatch`  | 任一匹配 | `.anyMatch(n -> n > 10)`          |
| `allMatch`  | 全部匹配 | `.allMatch(n -> n > 0)`           |
| `noneMatch` | 全不匹配 | `.noneMatch(Objects::isNull)`     |
| `findFirst` | 第一个  | `.findFirst()`                    |
| `findAny`   | 任意一个 | `.findAny()`                      |
| `max/min`   | 最值   | `.max(Comparator.naturalOrder())` |

* * *

## 四、Collectors 常用收集器

### 4.1 转集合

java

编辑

```
// 转 List
list.stream().collect(Collectors.toList());

// 转 Set（去重）
list.stream().collect(Collectors.toSet());

// 转 Collection
list.stream().collect(Collectors.toCollection(ArrayList::new));
```

### 4.2 转 Map

java

编辑

```
// 基础用法
Map<Integer, String> map = students.stream()
    .collect(Collectors.toMap(Student::getId, Student::getName));

// 处理 key 冲突
Map<Integer, String> map = students.stream()
    .collect(Collectors.toMap(
        Student::getId, 
        Student::getName,
        (v1, v2) -> v1  // 冲突时保留第一个
    ));
```

### 4.3 分组

java

编辑

```
// 单级分组
Map<String, List<Student>> map = students.stream()
    .collect(Collectors.groupingBy(Student::getGrade));

// 多级分组
Map<String, Map<String, List<Student>>> map = students.stream()
    .collect(Collectors.groupingBy(
        Student::getGrade,
        Collectors.groupingBy(Student::getGender)
    ));
```

### 4.4 分区

java

编辑

```
// 按条件分成两组（true/false）
Map<Boolean, List<Student>> map = students.stream()
    .collect(Collectors.partitioningBy(s -> s.getScore() > 60));
```

### 4.5 字符串连接

java

编辑

```
String result = list.stream()
    .collect(Collectors.joining(", ", "[", "]"));
// 输出：[a, b, c]
```

### 4.6 统计

java

编辑

```
// 基础统计
IntSummaryStatistics stats = list.stream()
    .collect(Collectors.summarizingInt(Integer::intValue));

stats.getCount();    // 数量
stats.getSum();      // 总和
stats.getAverage();  // 平均值
stats.getMax();      // 最大值
stats.getMin();      // 最小值
```

* * *

## 五、并行流使用指南

### 5.1 创建并行流

java

编辑

```
// 方式一：集合直接创建
list.parallelStream();

// 方式二：串行流转并行
stream.parallel();

// 方式三：并行流转串行
stream.sequential();
```

### 5.2 性能对比测试

java

编辑

```
// 数据量小，串行流更快
List<Integer> list = IntStream.range(0, 1000).boxed().collect(Collectors.toList());

// 数据量大，并行流有优势
List<Integer> bigList = IntStream.range(0, 1000000).boxed().collect(Collectors.toList());
```

### 5.3 注意事项 ！！！

表格

| 注意点      | 说明                             |
| -------- | ------------------------------ |
| **线程安全** | 避免在并行流中修改共享可变状态                |
| **顺序问题** | 并行流不保证顺序，用 `forEachOrdered` 保持 |
| **性能陷阱** | 数据量小反而慢，有状态操作不适合并行             |
| **调试困难** | 并行流调试困难，建议先用串行流验证              |

* * *

## 六、常见坑点总结

### 6.1 Stream 只能消费一次

java

编辑

```
//  错误用法
Stream<Integer> stream = list.stream();
stream.count();
stream.forEach(System.out::println);  // 报错！

//  正确用法
list.stream().count();
list.stream().forEach(System.out::println);
```

### 6.2 基本类型用专用 Stream

java

编辑

```
//  效率低（装箱拆箱）
Stream<Integer> stream = list.stream();
int sum = stream.mapToInt(Integer::intValue).sum();

//  效率高
IntStream stream = list.stream().mapToInt(Integer::intValue);
int sum = stream.sum();
```

### 6.3 空指针防护

java

编辑

```
//  可能空指针
list.stream()
    .filter(s -> s.length() > 3)
    .collect(Collectors.toList());

//  加空值过滤
list.stream()
    .filter(Objects::nonNull)
    .filter(s -> s.length() > 3)
    .collect(Collectors.toList());
```

### 6.4 调试技巧

java

编辑

```
// 用 peek() 中间调试
list.stream()
    .peek(n -> System.out.println("处理前：" + n))
    .map(n -> n * 2)
    .peek(n -> System.out.println("处理后：" + n))
    .collect(Collectors.toList());
```

* * *

## 七、实战场景示例

### 7.1 订单统计

java

编辑

```
// 需求：统计金额大于100的商品名称，按价格降序
List<String> result = orders.stream()
    .filter(o -> o.getAmount() > 100)
    .sorted(Comparator.comparing(Order::getPrice).reversed())
    .map(Order::getProductName)
    .distinct()
    .collect(Collectors.toList());
```

### 7.2 分组求和

java

编辑

```
// 需求：按类别分组，计算每类总金额
Map<String, Double> result = orders.stream()
    .collect(Collectors.groupingBy(
        Order::getCategory,
        Collectors.summingDouble(Order::getAmount)
    ));
```

### 7.3 提取字段去重

java

编辑

```
// 需求：获取所有不重复的用户 ID
List<Long> userIds = orders.stream()
    .map(Order::getUserId)
    .distinct()
    .collect(Collectors.toList());
```

### 7.4 条件判断

java

编辑

```
// 是否存在满足条件的元素
boolean hasExpensive = orders.stream()
    .anyMatch(o -> o.getAmount() > 1000);

// 是否全部满足条件
boolean allPaid = orders.stream()
    .allMatch(Order::isPaid);
```

* * *

## 八、学习心得

学完 Stream 这段时间，有几点感悟想和大家分享：

### 8.1 思维转变

> 从  **"怎么做"**  到  **"做什么"**

传统写法关注每一步怎么操作，Stream 关注最终要什么结果。

### 8.2 代码可读性

链式调用确实简洁，但**不要太长**，超过 5 行建议拆分。

### 8.3 性能考量

-   小数据量：串行流足够
-   大数据量：考虑并行流
-   有状态操作：避免并行

### 8.4 适度使用

不是所有场景都适合 Stream，**简单 for 循环有时更直观**。

* * *

## 九、推荐练习清单

-   用 Stream 重写之前的 for 循环代码
-   练习 `groupingBy` 多级分组
-   理解 `reduce` 的三种重载形式
-   对比并行流和串行流性能差异
-   掌握 `Optional` 与 Stream 配合使用
-   尝试用 Stream 解决实际业务问题

* * *

## 十、参考资源

表格

| 资源            | 链接                                                                       |
| ------------- | ------------------------------------------------------------------------ |
| Oracle 官方文档   | <https://docs.oracle.com/javase/8/docs/api/java/util/stream/Stream.html> |
| Java 8 官方教程   | <https://docs.oracle.com/javase/tutorial/collections/streams/>           |
| Stream API 源码 | <https://github.com/openjdk/jdk>                                         |

* * *

## 写在最后

这篇文章整理了我学习 Stream API 的核心知识点，**希望能帮到正在学习的你**。

如果觉得有用，欢迎：

-   ⭐ **点赞收藏**，方便日后查阅
-   💬 **评论区交流**，分享你的 Stream 使用心得
-   ➕ **关注我**，后续会更新更多 Java 学习总结

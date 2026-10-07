const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 MilkIQ veritabanı tohumlama (seed) işlemi başlatılıyor...');

  const dataFile = path.join(__dirname, '..', 'data', 'milkiq_store.json');
  if (!fs.existsSync(dataFile)) {
    console.log('⚠️ data/milkiq_store.json bulunamadı, varsayılan seed atlanıyor.');
    return;
  }

  const rawData = fs.readFileSync(dataFile, 'utf-8');
  const store = JSON.parse(rawData);

  // 1. System Setting
  if (store.settings) {
    await prisma.systemSetting.upsert({
      where: { id: 'singleton' },
      update: {
        farmName: store.settings.farmName || 'MilkIQ Süt Sığırcılığı İşletmesi',
        pinCode: store.settings.pinCode || '1234',
        milkSalePrice: store.settings.milkSalePrice || 16.5,
        proteinPerLiter: store.settings.proteinPerLiter || 90.0,
        maintenanceProteinFactor: store.settings.maintenanceProteinFactor || 0.67,
        defaultLiveWeight: store.settings.defaultLiveWeight || 600.0,
        defaultTargetMilk: store.settings.defaultTargetMilk || 25.0,
      },
      create: {
        id: 'singleton',
        farmName: store.settings.farmName || 'MilkIQ Süt Sığırcılığı İşletmesi',
        pinCode: store.settings.pinCode || '1234',
        milkSalePrice: store.settings.milkSalePrice || 16.5,
        proteinPerLiter: store.settings.proteinPerLiter || 90.0,
        maintenanceProteinFactor: store.settings.maintenanceProteinFactor || 0.67,
        defaultLiveWeight: store.settings.defaultLiveWeight || 600.0,
        defaultTargetMilk: store.settings.defaultTargetMilk || 25.0,
      },
    });
    console.log('✅ Sistem Ayarları başarıyla yüklendi.');
  }

  // 2. Feeds
  if (Array.isArray(store.feeds) && store.feeds.length > 0) {
    for (const f of store.feeds) {
      await prisma.feed.upsert({
        where: { id: f.id },
        update: {
          name: f.name,
          type: f.type,
          category: f.category || null,
          maxLimitKg: f.maxLimitKg ? Number(f.maxLimitKg) : null,
          dryMatter: Number(f.dryMatter),
          protein: Number(f.protein),
          starch: Number(f.starch),
          unitPrice: Number(f.unitPrice),
          isDefault: Boolean(f.isDefault),
        },
        create: {
          id: f.id,
          name: f.name,
          type: f.type,
          category: f.category || null,
          maxLimitKg: f.maxLimitKg ? Number(f.maxLimitKg) : null,
          dryMatter: Number(f.dryMatter),
          protein: Number(f.protein),
          starch: Number(f.starch),
          unitPrice: Number(f.unitPrice),
          isDefault: Boolean(f.isDefault),
        },
      });
    }
    console.log(`✅ ${store.feeds.length} adet yem başarıyla yüklendi.`);
  }

  // 3. Factory Feeds
  if (Array.isArray(store.factoryFeeds) && store.factoryFeeds.length > 0) {
    for (const ff of store.factoryFeeds) {
      await prisma.factoryFeed.upsert({
        where: { id: ff.id },
        update: {
          brand: ff.brand,
          name: ff.name,
          category: ff.category,
          categoryLabel: ff.categoryLabel || null,
          protein: Number(ff.protein),
          starch: Number(ff.starch),
          dryMatter: Number(ff.dryMatter),
          energyME: Number(ff.energyME),
          cellulose: Number(ff.cellulose),
          calcium: ff.calcium ? Number(ff.calcium) : null,
          phosphorus: ff.phosphorus ? Number(ff.phosphorus) : null,
          approxPrice: Number(ff.approxPrice),
          bagWeight: ff.bagWeight ? Number(ff.bagWeight) : 50,
          description: ff.description || '',
        },
        create: {
          id: ff.id,
          brand: ff.brand,
          name: ff.name,
          category: ff.category,
          categoryLabel: ff.categoryLabel || null,
          protein: Number(ff.protein),
          starch: Number(ff.starch),
          dryMatter: Number(ff.dryMatter),
          energyME: Number(ff.energyME),
          cellulose: Number(ff.cellulose),
          calcium: ff.calcium ? Number(ff.calcium) : null,
          phosphorus: ff.phosphorus ? Number(ff.phosphorus) : null,
          approxPrice: Number(ff.approxPrice),
          bagWeight: ff.bagWeight ? Number(ff.bagWeight) : 50,
          description: ff.description || '',
        },
      });
    }
    console.log(`✅ ${store.factoryFeeds.length} adet fabrika yemi kataloğu başarıyla yüklendi.`);
  }

  // 4. Rations & Items
  if (Array.isArray(store.rations) && store.rations.length > 0) {
    for (const r of store.rations) {
      await prisma.ration.upsert({
        where: { id: r.id },
        update: {
          title: r.title,
          liveWeight: Number(r.liveWeight || 600),
          targetMilk: Number(r.targetMilk || 25),
          isActive: Boolean(r.isActive),
          notes: r.notes || null,
        },
        create: {
          id: r.id,
          title: r.title,
          liveWeight: Number(r.liveWeight || 600),
          targetMilk: Number(r.targetMilk || 25),
          isActive: Boolean(r.isActive),
          notes: r.notes || null,
        },
      });

      // Clear existing items then re-insert
      await prisma.rationItem.deleteMany({ where: { rationId: r.id } });
      if (Array.isArray(r.items)) {
        for (const item of r.items) {
          // Verify feed exists before creating relation
          const feedExists = await prisma.feed.findUnique({ where: { id: item.feedId } });
          if (feedExists) {
            await prisma.rationItem.create({
              data: {
                rationId: r.id,
                feedId: item.feedId,
                freshAmount: Number(item.freshAmount),
              },
            });
          }
        }
      }
    }
    console.log(`✅ ${store.rations.length} adet rasyon başarıyla yüklendi.`);
  }

  // 5. Monthly Expenses
  if (Array.isArray(store.expenses) && store.expenses.length > 0) {
    for (const exp of store.expenses) {
      await prisma.monthlyExpense.upsert({
        where: { id: exp.id },
        update: {
          category: exp.category,
          amount: Number(exp.amount),
          month: exp.month,
          description: exp.description || null,
        },
        create: {
          id: exp.id,
          category: exp.category,
          amount: Number(exp.amount),
          month: exp.month,
          description: exp.description || null,
        },
      });
    }
    console.log(`✅ ${store.expenses.length} adet genel gider kaydı başarıyla yüklendi.`);
  }

  // 6. Daily Productions
  if (Array.isArray(store.dailyProductions) && store.dailyProductions.length > 0) {
    for (const prod of store.dailyProductions) {
      await prisma.dailyProduction.upsert({
        where: { date: prod.date },
        update: {
          totalMilk: Number(prod.totalMilk),
          milkingCows: Number(prod.milkingCows),
          averagePerCow: Number(prod.averagePerCow || 0),
          notes: prod.notes || null,
        },
        create: {
          id: prod.id || undefined,
          date: prod.date,
          totalMilk: Number(prod.totalMilk),
          milkingCows: Number(prod.milkingCows),
          averagePerCow: Number(prod.averagePerCow || 0),
          notes: prod.notes || null,
        },
      });
    }
    console.log(`✅ ${store.dailyProductions.length} adet günlük süt üretimi kaydı başarıyla yüklendi.`);
  }

  // 7. Monthly Cost Reports
  if (Array.isArray(store.costReports) && store.costReports.length > 0) {
    for (const rep of store.costReports) {
      await prisma.monthlyCostReport.upsert({
        where: { id: rep.id },
        update: {
          month: rep.month,
          title: rep.title,
          daysInMonth: Number(rep.daysInMonth),
          totalMilkProduction: Number(rep.totalMilkProduction),
          dailyAverageMilk: Number(rep.dailyAverageMilk),
          milkingCowsCount: Number(rep.milkingCowsCount),
          feedCostPerLiter: Number(rep.feedCostPerLiter),
          dailyFeedCostPerCow: Number(rep.dailyFeedCostPerCow),
          overheadCostPerLiter: Number(rep.overheadCostPerLiter),
          totalCostPerLiter: Number(rep.totalCostPerLiter),
          netProfitPerLiter: Number(rep.netProfitPerLiter),
          milkSalePrice: Number(rep.milkSalePrice),
          totalFeedCost: Number(rep.totalFeedCost),
          totalOverheadCost: Number(rep.totalOverheadCost),
          totalOperatingCost: Number(rep.totalOperatingCost),
          totalRevenue: Number(rep.totalRevenue),
          netProfitTotal: Number(rep.netProfitTotal),
          expenseBreakdown: rep.expenseBreakdown || [],
          notes: rep.notes || null,
        },
        create: {
          id: rep.id,
          month: rep.month,
          title: rep.title,
          daysInMonth: Number(rep.daysInMonth),
          totalMilkProduction: Number(rep.totalMilkProduction),
          dailyAverageMilk: Number(rep.dailyAverageMilk),
          milkingCowsCount: Number(rep.milkingCowsCount),
          feedCostPerLiter: Number(rep.feedCostPerLiter),
          dailyFeedCostPerCow: Number(rep.dailyFeedCostPerCow),
          overheadCostPerLiter: Number(rep.overheadCostPerLiter),
          totalCostPerLiter: Number(rep.totalCostPerLiter),
          netProfitPerLiter: Number(rep.netProfitPerLiter),
          milkSalePrice: Number(rep.milkSalePrice),
          totalFeedCost: Number(rep.totalFeedCost),
          totalOverheadCost: Number(rep.totalOverheadCost),
          totalOperatingCost: Number(rep.totalOperatingCost),
          totalRevenue: Number(rep.totalRevenue),
          netProfitTotal: Number(rep.netProfitTotal),
          expenseBreakdown: rep.expenseBreakdown || [],
          notes: rep.notes || null,
        },
      });
    }
    console.log(`✅ ${store.costReports.length} adet aylık maliyet raporu başarıyla yüklendi.`);
  }

  console.log('🎉 MilkIQ tüm veritabanı tohumlama işlemi eksiksiz tamamlandı!');
}

main()
  .catch((e) => {
    console.error('❌ Seed işleminde hata oluştu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

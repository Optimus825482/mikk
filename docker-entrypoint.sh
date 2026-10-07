#!/bin/sh
set -e

echo "🚀 MilkIQ konteyneri başlatılıyor..."

# Veritabanı tanımlıysa otomatik tablo oluşturma ve verileri aktarma
if [ -n "$DATABASE_URL" ]; then
  echo "📦 PostgreSQL veritabanı şeması eşitleniyor (prisma db push)..."
  npx prisma db push --skip-generate || echo "⚠️ prisma db push atlandı veya ertelendi."

  echo "🌱 MilkIQ tüm kayıtlı verileri PostgreSQL'e aktarılıyor (seed)..."
  node prisma/seed.js || echo "⚠️ seed işlemi atlandı."
fi

echo "🟢 MilkIQ uygulaması başlatılıyor (port 3000)..."
exec npm start

import {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { ItemType } from '../components/Chart/Chart';

type ChartItemType = {
  label: string;
  value: number | null;
}

export default ({
  byMax,
}: { byMax: boolean }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<ChartItemType[]>([]);

  useEffect(() => {
    const resize = () => {
      if (ref.current) {
        const size = Math.min(ref.current.parentElement?.clientWidth || 0, 500);
        ref.current.width = size;
        ref.current.height = size;
      }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const onUpdate = useCallback((items: ItemType[]) => {
    setData(items.map((el) => ({ label: el.label, value: Number.parseInt(el.value) || null })));
  }, []);

  const isValid = useMemo(() => data.length >= 2 && !data.some((el) => el.value === null), [data]);

  const onDraw = useCallback(() => {
    if (!isValid || !ref.current) return;
    const ctx = ref.current.getContext('2d');
    if (!ctx) return;

    const { width, height } = ref.current;
    const radius = width * 0.4;
    const center = { x: width / 2, y: height / 2 };
    const sectors = data.reduce((acc, _, index) => [...acc, (360 / data.length) * index], [] as number[]);
    const dots = [] as number[][][];
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#000';
    ctx.strokeStyle = '#000';
    const SPACES_COUNT = 4;
    for (let i = 0; i < SPACES_COUNT; i += 1) {
      dots.push([]);
      sectors.forEach((el) => {
        const x = center.x + Math.sin((el / 360) * Math.PI * 2) * radius * ((SPACES_COUNT - i) / SPACES_COUNT);
        const y = center.y - Math.cos((el / 360) * Math.PI * 2) * radius * ((SPACES_COUNT - i) / SPACES_COUNT);
        dots[i].push([x, y]);
      });
    }
    dots[0].forEach((el) => {
      ctx.fillRect(el[0] - 3, el[1] - 3, 6, 6);
    });

    ctx.beginPath();
    dots[0].forEach((el) => {
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(el[0], el[1]);
    });

    dots.forEach((space) => {
      ctx.moveTo(space[0][0], space[0][1]);
      space.forEach((el, index) => {
        if (!index) return;
        ctx.lineTo(el[0], el[1]);
      });
      ctx.lineTo(space[0][0], space[0][1]);
    });
    ctx.stroke();

    ctx.strokeStyle = '#f00';
    ctx.lineWidth = 2;

    const sum = data.reduce((acc, el) => (byMax ? Math.max(acc, el.value!) : acc + el.value!), 0);
    ctx.beginPath();
    const start = { x: 0, y: 0 };
    data.forEach((item, index) => {
      const x = center.x + Math.sin((sectors[index] / 360) * Math.PI * 2) * radius * (item.value! / sum);
      const y = center.y - Math.cos((sectors[index] / 360) * Math.PI * 2) * radius * (item.value! / sum);
      if (index === 0) {
        start.x = x;
        start.y = y;
        ctx.moveTo(start.x, start.y);
      }
      ctx.lineTo(x, y);
    });
    ctx.lineTo(start.x, start.y);
    ctx.stroke();

    dots[0].forEach((el, index) => {
      const text = ctx.measureText(data[index].label);
      const fontSize = 18;
      ctx.font = `${fontSize}px sans-serif`;
      const yDifferent = (el[1] - center.y) / (height / (fontSize * 2)) + fontSize * 0.25;

      if (Math.round(el[0]) - width / 2 > 0) {
        ctx.fillText(data[index].label, el[0] + 5, el[1] + yDifferent);
      } else if (Math.round(el[0]) - width / 2 < 0) {
        ctx.fillText(data[index].label, el[0] - text.width - 5, el[1] + yDifferent);
      } else {
        ctx.fillText(data[index].label, el[0] - text.width / 2, el[1] + yDifferent);
      }
    });
  }, [isValid, data, byMax]);

  return {
    ref, onUpdate, isValid, onDraw,
  };
};

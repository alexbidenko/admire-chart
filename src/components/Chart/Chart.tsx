import React, {
  FormEvent, memo, useCallback, useEffect, useState,
} from 'react';
import {
  Button, Checkbox, Divider, FormControlLabel, IconButton, TextField,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';
import useChart from '../../hooks/useChart';

const useStyles = makeStyles((theme) => ({
  root: {
    '&': {
      maxWidth: 500,
      margin: '0 auto',
    },
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: `calc(50% - ${theme.spacing(2)}px - 24px)`,
    },
  },
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  group: {
    margin: `0 -${theme.spacing(1)}px`,
  },
}));

export type ItemType = {
  label: string;
  value: string;
  id: number;
};

const Chart: React.FC = () => {
  const [data, setData] = useState<ItemType[]>([{ label: '', value: '0', id: 1 }]);
  const [byMax, setByMax] = useState(false);
  const {
    ref, onUpdate, isValid, onDraw,
  } = useChart({
    byMax,
  });
  const classes = useStyles();

  const addItem = useCallback(() => {
    setData((prev) => [...prev, { label: '', value: '0', id: new Date().getTime() }]);
  }, []);

  const removeItem = useCallback((id) => {
    setData((prev) => prev.filter((el) => el.id !== id));
  }, []);

  const onChange = useCallback((event: FormEvent, item: ItemType) => {
    setData((prev) => {
      const target = event.target as HTMLInputElement;
      if (target.name === 'label') item.label = target.value;
      else item.value = target.value;
      return [...prev];
    });
  }, []);

  useEffect(() => {
    onUpdate(data);
  }, [onUpdate, data]);

  return (
    <form className={classes.root}>
      <div className={classes.container}>
        <canvas ref={ref} />
      </div>
      {data.map((item) => (
        <div key={item.id} className={classes.group}>
          <TextField
            placeholder="Подпись"
            name="label"
            value={item.label}
            onChange={(event) => onChange(event, item)}
          />
          <TextField
            placeholder="Значение"
            name="value"
            value={item.value}
            type="number"
            onChange={(event) => onChange(event, item)}
          />
          <IconButton color="primary" onClick={() => removeItem(item.id)} aria-label="Удалить строку данных">
            <CloseIcon />
          </IconButton>
        </div>
      ))}
      <Divider />
      <FormControlLabel control={<Checkbox checked={byMax} onChange={() => setByMax(!byMax)} />} label="Считать от максимального значения" />
      <Divider />
      <Button onClick={addItem} aria-label="Добавить данные для графика">Добавить</Button>
      <Button disabled={!isValid} onClick={onDraw} aria-label="Построить график">Построить</Button>
    </form>
  );
};

export default memo(Chart);

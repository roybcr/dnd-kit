import React, {useMemo, useState} from 'react';
import classNames from 'classnames';

import {Item, GridContainer} from '../components';

import {
  closestRect,
  rectIntersection,
  DraggableContext,
  useDraggable,
  useDroppable,
  useSensor,
  MouseSensor,
  KeyboardSensor,
  TouchSensor,
  Translate,
  UniqueIdentifier,
  CollisionDetection as CollisionDetectionType,
} from '@dropshift/core';
import {CSS} from '@dropshift/utilities';

import styles from './Droppable.module.css';

export default {
  title: 'Core|Droppable/Basic',
  root: 'Blah',
};

const defaultCoordinates = {
  x: 0,
  y: 0,
};

const defaultItemStyle: React.CSSProperties = {
  position: 'absolute',
  top: 20,
  left: 20,
  zIndex: 1,
};

interface Props {
  collisionDetection?: CollisionDetectionType;
  containers?: string[];
  value?: string;
}

function DroppableStory({
  containers = ['A'],
  value = 'Drag me',
  collisionDetection,
}: Props) {
  const [{translate}, setTranslate] = useState<{
    initialTranslate: Translate;
    translate: Translate;
  }>({initialTranslate: defaultCoordinates, translate: defaultCoordinates});
  const [parent, setParent] = useState<UniqueIdentifier | null>(null);
  const mouseSensor = useSensor(MouseSensor, {});
  const touchSensor = useSensor(TouchSensor, {});
  const keyboardSensor = useSensor(KeyboardSensor, {});
  const sensors = useMemo(() => [mouseSensor, touchSensor, keyboardSensor], [
    mouseSensor,
    touchSensor,
    keyboardSensor,
  ]);

  const item = (
    <Draggable
      value={value}
      style={{
        ...defaultItemStyle,
        transform: CSS.Transform.toString({
          ...translate,
          scaleX: 1,
          scaleY: 1,
        }),
      }}
    />
  );

  return (
    <DraggableContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={() => {}}
      onDragMove={({delta}) => {
        setTranslate(({initialTranslate}) => ({
          initialTranslate,
          translate: {
            x: initialTranslate.x + delta.x,
            y: initialTranslate.y + delta.y,
          },
        }));
      }}
      onDragEnd={({over}) => {
        setParent(over ? over.id : null);
        setTranslate(() => ({
          translate: defaultCoordinates,
          initialTranslate: defaultCoordinates,
        }));
      }}
      onDragCancel={() => {
        setTranslate(({initialTranslate}) => ({
          translate: initialTranslate,
          initialTranslate: defaultCoordinates,
        }));
      }}
    >
      {parent === null ? item : null}
      <GridContainer columns={3}>
        {containers.map((id) => (
          <Droppable key={id} id={id}>
            {parent === id ? item : 'Drop here'}
          </Droppable>
        ))}
      </GridContainer>
    </DraggableContext>
  );
}

interface Draggable {
  value: React.ReactNode;
  handle?: boolean;
  style?: React.CSSProperties;
}

interface DroppableProps {
  children: React.ReactNode;
  id: string;
}

function Droppable({children, id}: DroppableProps) {
  const {isOver, setNodeRef} = useDroppable({id});

  return (
    <div
      className={classNames(styles.DroppableContaner, isOver && styles.over)}
      ref={setNodeRef}
    >
      {children}
    </div>
  );
}

function Draggable({value, handle, style}: Draggable) {
  const {isDragging, setNodeRef, listeners} = useDraggable({
    id: 'draggable-item',
  });

  return (
    <Item
      clone={isDragging}
      ref={setNodeRef}
      value={value}
      wrapperStyle={style}
      handle={handle}
      listeners={listeners}
    />
  );
}

export const SimpleExample = () => <DroppableStory />;

export const MultipleContainers = () => (
  <DroppableStory containers={['A', 'B', 'C']} />
);

export const CollisionDetection = () => {
  const [{algorithm}, setCollisionDetectionAlgorithm] = useState({
    algorithm: rectIntersection,
  });

  return (
    <>
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h3>Collision detection algorithm</h3>
        <label>
          <input
            type="radio"
            value="rectIntersection"
            checked={algorithm === rectIntersection}
            onClick={() =>
              setCollisionDetectionAlgorithm({algorithm: rectIntersection})
            }
          />
          Rect Intersection
        </label>
        <label>
          <input
            type="radio"
            value="rectCollision"
            checked={algorithm === closestRect}
            onClick={() =>
              setCollisionDetectionAlgorithm({algorithm: closestRect})
            }
          />
          Closest Rect
        </label>
      </div>
      <DroppableStory
        collisionDetection={algorithm}
        containers={['A', 'B', 'C']}
      />
    </>
  );
};
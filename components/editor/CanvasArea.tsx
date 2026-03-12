import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Circle, Transformer, RegularPolygon, Star, Image as KonvaImage, Group, Line } from 'react-konva';
import { Page, CanvasElement, TextElement, ShapeElement, ImageElement, TableElement, QuestionBlockElement } from './types';
import useImage from 'use-image';

interface CanvasAreaProps {
  page: Page;
  width: number;
  height: number;
  zoom: number;
  showGrid?: boolean;
  selectedElementIds: string[];
  onSelectElements: (ids: string[]) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onUpdateElements: (updates: { id: string, updates: Partial<CanvasElement> }[]) => void;
  stageRef: React.RefObject<any>;
}

const ImageNode = ({ element, isSelected, onSelect, onChange, showGrid }: { 
  element: ImageElement; 
  isSelected: boolean; 
  onSelect: (e: any) => void; 
  onChange: (newAttrs: any) => void;
  showGrid: boolean;
}) => {
  const [image] = useImage(element.src);
  const shapeRef = useRef<any>(null);

  return (
    <KonvaImage
      ref={shapeRef}
      name="element"
      id={element.id}
      image={image}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      opacity={element.opacity ?? 1}
      draggable={!element.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        let x = e.target.x();
        let y = e.target.y();
        if (showGrid) {
          x = Math.round(x / 50) * 50;
          y = Math.round(y / 50) * 50;
        }
        onChange({ x, y });
      }}
      onTransformEnd={(e) => {
        const node = shapeRef.current;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        
        let x = node.x();
        let y = node.y();
        let width = Math.max(5, node.width() * scaleX);
        let height = Math.max(5, node.height() * scaleY);

        if (showGrid) {
          x = Math.round(x / 50) * 50;
          y = Math.round(y / 50) * 50;
          width = Math.round(width / 50) * 50;
          height = Math.round(height / 50) * 50;
        }

        onChange({
          x,
          y,
          width,
          height,
          rotation: node.rotation(),
        });
      }}
    />
  );
};

const QuestionBlockNode = ({ element, isSelected, onSelect, onChange, showGrid }: {
  element: QuestionBlockElement;
  isSelected: boolean;
  onSelect: (e: any) => void;
  onChange: (newAttrs: any) => void;
  showGrid: boolean;
}) => {
  const shapeRef = useRef<any>(null);
  const [diagram] = useImage(element.diagramUrl || '');

  return (
    <Group
      ref={shapeRef}
      name="element"
      id={element.id}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      opacity={element.opacity ?? 1}
      draggable={!element.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        let x = e.target.x();
        let y = e.target.y();
        if (showGrid) {
          x = Math.round(x / 50) * 50;
          y = Math.round(y / 50) * 50;
        }
        onChange({ x, y });
      }}
    >
      <Rect
        width={element.width}
        height={element.height}
        fill="#FFFFFF"
        stroke={isSelected ? "#3B82F6" : "#E2E8F0"}
        strokeWidth={1}
        cornerRadius={8}
        shadowBlur={5}
        shadowOpacity={0.1}
      />
      
      <Text
        x={15}
        y={15}
        width={element.width - 30}
        text={element.questionText}
        fontSize={element.fontSize}
        fontFamily={element.fontFamily}
        fill={element.fill}
        lineHeight={1.4}
      />

      {element.diagramUrl && diagram && (
        <KonvaImage
          image={diagram}
          x={15}
          y={60}
          width={element.width - 30}
          height={80}
          style={{ objectFit: 'contain' }}
        />
      )}

      <Group y={element.diagramUrl ? 150 : 60}>
        {Object.entries(element.options).map(([key, value], idx) => (
          <Text
            key={key}
            x={15}
            y={idx * 25}
            width={element.width - 30}
            text={`${key}. ${value}`}
            fontSize={element.fontSize - 2}
            fontFamily={element.fontFamily}
            fill="#475569"
          />
        ))}
      </Group>
    </Group>
  );
};

const TableNode = ({ element, isSelected, onSelect, onChange, showGrid }: {
  element: TableElement;
  isSelected: boolean;
  onSelect: (e: any) => void;
  onChange: (newAttrs: any) => void;
  showGrid: boolean;
}) => {
  const shapeRef = useRef<any>(null);
  const cellWidth = element.width / element.cols;
  const cellHeight = element.height / element.rows;

  return (
    <Group
      ref={shapeRef}
      name="element"
      id={element.id}
      x={element.x}
      y={element.y}
      rotation={element.rotation}
      opacity={element.opacity ?? 1}
      draggable={!element.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        let x = e.target.x();
        let y = e.target.y();
        if (showGrid) {
          x = Math.round(x / 50) * 50;
          y = Math.round(y / 50) * 50;
        }
        onChange({ x, y });
      }}
    >
      {/* Table Border */}
      <Rect
        width={element.width}
        height={element.height}
        stroke="#000000"
        strokeWidth={1}
      />

      {/* Grid Lines */}
      {Array(element.rows + 1).fill(0).map((_, i) => (
        <Line
          key={`row-${i}`}
          points={[0, i * cellHeight, element.width, i * cellHeight]}
          stroke="#000000"
          strokeWidth={1}
        />
      ))}
      {Array(element.cols + 1).fill(0).map((_, i) => (
        <Line
          key={`col-${i}`}
          points={[i * cellWidth, 0, i * cellWidth, element.height]}
          stroke="#000000"
          strokeWidth={1}
        />
      ))}

      {/* Cells Data */}
      {element.data.map((row, rowIndex) => 
        row.map((cell, colIndex) => (
          <Text
            key={`${rowIndex}-${colIndex}`}
            x={colIndex * cellWidth + 5}
            y={rowIndex * cellHeight + (cellHeight / 2) - 7}
            width={cellWidth - 10}
            text={cell}
            fontSize={12}
            fontFamily="Arial"
            fill="#000000"
            align="center"
          />
        ))
      )}
    </Group>
  );
};

export function CanvasArea({ 
  page, 
  width, 
  height, 
  zoom, 
  showGrid = false,
  selectedElementIds, 
  onSelectElements, 
  onUpdateElement,
  onUpdateElements,
  stageRef 
}: CanvasAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trRef = useRef<any>(null);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (trRef.current) {
      const stage = stageRef.current;
      const selectedNodes = selectedElementIds.map(id => stage.findOne(`#${id}`)).filter(Boolean);
      trRef.current.nodes(selectedNodes);
      trRef.current.getLayer().batchDraw();
    }
  }, [selectedElementIds]);

  // Center the canvas initially
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;
      
      const scaledWidth = width * zoom;
      const scaledHeight = height * zoom;

      setStagePos({
        x: Math.max(0, (containerWidth - scaledWidth) / 2),
        y: Math.max(0, (containerHeight - scaledHeight) / 2) + 40 // Add some top padding
      });
    }
  }, [width, height, zoom, containerRef.current?.offsetWidth, containerRef.current?.offsetHeight]);

  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === 'background';
    if (clickedOnEmpty) {
      onSelectElements([]);
    }
  };

  const handleSelect = (e: any, id: string) => {
    const isShiftPressed = e.evt.shiftKey;
    if (isShiftPressed) {
      if (selectedElementIds.includes(id)) {
        onSelectElements(selectedElementIds.filter(sid => sid !== id));
      } else {
        onSelectElements([...selectedElementIds, id]);
      }
    } else {
      onSelectElements([id]);
    }
  };

  const handleDragEnd = (e: any) => {
    const id = e.target.id();
    const isSelected = selectedElementIds.includes(id);
    
    if (isSelected && selectedElementIds.length > 1) {
      const node = e.target;
      const dx = node.x() - page.elements.find(el => el.id === id)!.x;
      const dy = node.y() - page.elements.find(el => el.id === id)!.y;
      
      const updates = selectedElementIds.map(sid => {
        const el = page.elements.find(e => e.id === sid)!;
        let nx = el.x + dx;
        let ny = el.y + dy;
        
        if (showGrid) {
          nx = Math.round(nx / 50) * 50;
          ny = Math.round(ny / 50) * 50;
        }
        
        return { id: sid, updates: { x: nx, y: ny } };
      });
      
      onUpdateElements(updates);
    } else {
      let x = e.target.x();
      let y = e.target.y();
      if (showGrid) {
        x = Math.round(x / 50) * 50;
        y = Math.round(y / 50) * 50;
      }
      onUpdateElement(id, { x, y });
    }
  };

  const handleTransformEnd = (e: any) => {
    const node = e.target;
    const id = node.id();
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    let x = node.x();
    let y = node.y();
    let width = Math.max(5, node.width() * scaleX);
    let height = Math.max(5, node.height() * scaleY);

    if (showGrid) {
      x = Math.round(x / 50) * 50;
      y = Math.round(y / 50) * 50;
      width = Math.round(width / 50) * 50;
      height = Math.round(height / 50) * 50;
    }

    onUpdateElement(id, {
      x,
      y,
      width,
      height,
      rotation: node.rotation(),
    });
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-auto bg-slate-100 relative"
      style={{
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}
    >
      <div 
        className="absolute"
        style={{
          left: stagePos.x,
          top: stagePos.y,
          width: width * zoom,
          height: height * zoom,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          backgroundColor: page.background,
        }}
      >
        <Stage
          ref={stageRef}
          width={width * zoom}
          height={height * zoom}
          scaleX={zoom}
          scaleY={zoom}
          onMouseDown={checkDeselect}
          onTouchStart={checkDeselect}
        >
          <Layer>
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill={page.background}
              name="background"
            />
            {showGrid && (
              <Group listening={false}>
                {Array.from({ length: Math.ceil(width / 50) + 1 }).map((_, i) => (
                  <Line
                    key={`v-${i}`}
                    points={[i * 50, 0, i * 50, height]}
                    stroke="#E2E8F0"
                    strokeWidth={0.5}
                    dash={[5, 5]}
                  />
                ))}
                {Array.from({ length: Math.ceil(height / 50) + 1 }).map((_, i) => (
                  <Line
                    key={`h-${i}`}
                    points={[0, i * 50, width, i * 50]}
                    stroke="#E2E8F0"
                    strokeWidth={0.5}
                    dash={[5, 5]}
                  />
                ))}
              </Group>
            )}
            {page.elements
              .filter(el => !el.hidden)
              .sort((a, b) => a.zIndex - b.zIndex)
              .map((el) => {
                if (el.type === 'text') {
                  const textEl = el as TextElement;
                  return (
                    <Text
                      key={el.id}
                      id={el.id}
                      name="element"
                      text={textEl.text}
                      x={textEl.x}
                      y={textEl.y}
                      width={textEl.width}
                      fontSize={textEl.fontSize}
                      fontFamily={textEl.fontFamily}
                      fill={textEl.fill}
                      fontStyle={`${textEl.fontStyle} ${textEl.fontWeight}`}
                      textDecoration={textEl.textDecoration}
                      align={textEl.align}
                      rotation={textEl.rotation}
                      draggable={!textEl.locked}
                      onClick={(e) => handleSelect(e, el.id)}
                      onTap={(e) => handleSelect(e, el.id)}
                      onDragEnd={handleDragEnd}
                      onTransformEnd={handleTransformEnd}
                    />
                  );
                } else if (el.type === 'shape') {
                  const shapeEl = el as ShapeElement;
                  const commonProps = {
                    key: el.id,
                    id: el.id,
                    name: "element",
                    x: shapeEl.x,
                    y: shapeEl.y,
                    width: shapeEl.width,
                    height: shapeEl.height,
                    fill: shapeEl.fill,
                    stroke: shapeEl.stroke,
                    strokeWidth: shapeEl.strokeWidth,
                    rotation: shapeEl.rotation,
                    draggable: !shapeEl.locked,
                    onClick: (e: any) => handleSelect(e, el.id),
                    onTap: (e: any) => handleSelect(e, el.id),
                    onDragEnd: handleDragEnd,
                    onTransformEnd: handleTransformEnd,
                  };

                  if (shapeEl.shapeType === 'rect') {
                    return <Rect {...commonProps} cornerRadius={shapeEl.cornerRadius} />;
                  } else if (shapeEl.shapeType === 'circle') {
                    return <Circle {...commonProps} radius={shapeEl.width / 2} offsetX={-shapeEl.width / 2} offsetY={-shapeEl.height / 2} />;
                  } else if (shapeEl.shapeType === 'triangle') {
                    return <RegularPolygon {...commonProps} sides={3} radius={shapeEl.width / 2} offsetX={-shapeEl.width / 2} offsetY={-shapeEl.height / 2} />;
                  } else if (shapeEl.shapeType === 'star') {
                    return <Star {...commonProps} numPoints={5} innerRadius={shapeEl.width / 4} outerRadius={shapeEl.width / 2} offsetX={-shapeEl.width / 2} offsetY={-shapeEl.height / 2} />;
                  }
                } else if (el.type === 'image') {
                  return (
                    <ImageNode 
                      key={el.id}
                      element={el as ImageElement} 
                      isSelected={selectedElementIds.includes(el.id)} 
                      onSelect={(e) => handleSelect(e, el.id)} 
                      onChange={(newAttrs) => onUpdateElement(el.id, newAttrs)} 
                      showGrid={showGrid}
                    />
                  );
                } else if (el.type === 'table') {
                  return (
                    <TableNode 
                      key={el.id}
                      element={el as TableElement} 
                      isSelected={selectedElementIds.includes(el.id)} 
                      onSelect={(e) => handleSelect(e, el.id)} 
                      onChange={(newAttrs) => onUpdateElement(el.id, newAttrs)} 
                      showGrid={showGrid}
                    />
                  );
                } else if (el.type === 'question_block') {
                  return (
                    <QuestionBlockNode 
                      key={el.id}
                      element={el as QuestionBlockElement} 
                      isSelected={selectedElementIds.includes(el.id)} 
                      onSelect={(e) => handleSelect(e, el.id)} 
                      onChange={(newAttrs) => onUpdateElement(el.id, newAttrs)} 
                      showGrid={showGrid}
                    />
                  );
                }
                return null;
              })}
            <Transformer
              ref={trRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

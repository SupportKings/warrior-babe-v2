"use client";

import React, { useState, useRef } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface HoverLinkProps {
  href?: string;
  children: React.ReactNode;
  preview?: {
    image?: string;
    name: string;
    title?: string;
    email?: string;
    phone?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    badge?: {
      text: string;
      variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    };
    stats?: Array<{
      label: string;
      value: string | number;
    }>;
  };
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  disabled?: boolean;
}

export function HoverLink({ 
  href, 
  children, 
  preview, 
  onClick, 
  className = "",
  disabled = false 
}: HoverLinkProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const motionX = useMotionValue(0);
  const motionY = useMotionValue(0);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!preview || disabled) return;
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: rect.right + 10,
      y: rect.top
    });
    
    hoverTimeoutRef.current = setTimeout(() => {
      setShowPreview(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setShowPreview(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!showPreview) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    motionX.set(rect.right + 10);
    motionY.set(rect.top);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    
    if (onClick) {
      e.preventDefault();
      onClick(e);
    } else if (href) {
      window.location.href = href;
    }
  };

  const LinkWrapper = href ? 'a' : 'div';

  return (
    <>
      <LinkWrapper
        {...(href && { href })}
        className={`inline-flex items-center transition-colors hover:text-primary cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      >
        {children}
      </LinkWrapper>

      {/* Preview Card */}
      {showPreview && preview && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="fixed z-50 pointer-events-none"
          style={{
            left: mousePosition.x,
            top: mousePosition.y,
            transform: 'translateY(-50%)'
          }}
        >
          <Card className="w-80 shadow-xl border-border/50 bg-background/95 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <Avatar className="h-12 w-12 border-2 border-primary/10">
                  <AvatarImage src={preview.image} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {preview.name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                {/* Main Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground truncate">
                      {preview.name}
                    </h4>
                    {preview.badge && (
                      <Badge variant={preview.badge.variant || 'secondary'} className="text-xs">
                        {preview.badge.text}
                      </Badge>
                    )}
                  </div>
                  
                  {preview.title && (
                    <p className="text-sm text-muted-foreground mb-2 truncate">
                      {preview.title}
                    </p>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-1 mb-3">
                    {preview.email && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{preview.email}</span>
                      </div>
                    )}
                    {preview.phone && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{preview.phone}</span>
                      </div>
                    )}
                    {preview.location && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{preview.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Date Range */}
                  {(preview.startDate || preview.endDate) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {preview.startDate && format(new Date(preview.startDate), 'MMM d, yyyy')}
                        {preview.startDate && preview.endDate && ' - '}
                        {preview.endDate && format(new Date(preview.endDate), 'MMM d, yyyy')}
                        {preview.startDate && !preview.endDate && ' - Present'}
                      </span>
                    </div>
                  )}

                  {/* Stats */}
                  {preview.stats && preview.stats.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {preview.stats.map((stat, index) => (
                        <div key={index} className="text-center">
                          <div className="text-sm font-semibold text-foreground">
                            {stat.value}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* External Link Icon */}
                {href && (
                  <ExternalLink className="h-3 w-3 text-muted-foreground mt-1 flex-shrink-0" />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </>
  );
}
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TimeDisplay } from "@/components/ui/time-display";
import type { TicketComment, CoachComment } from "@/features/shared/types/activity";

type GenericComment = TicketComment | CoachComment;

interface CommentItemProps {
  comment: GenericComment;
  timestamp: string;
}

export function CommentItem({ comment, timestamp }: CommentItemProps) {
  return (
    <div className="relative m-0 flex border-0 px-0 pt-0 pb-[18px] align-baseline">
      <div
        className="-outline-offset-1 relative m-0 flex min-w-[min(300px,100%)] max-w-full flex-1 flex-col rounded-lg border-[0.5px] border-[lch(83.025_0_282.863)] border-solid bg-[lch(100_0_282.863)] p-0 align-baseline shadow-[lch(0_0_0_/_0.022)_0_3px_6px_-2px,lch(0_0_0_/_0.044)_0_1px_1px] dark:border-[lch(19_3.54_272)] dark:bg-[lch(4.8_0.7_272)]"
        tabIndex={-1}
      >
        <div className="relative m-0 border-0 p-0 align-baseline">
          <div className="m-0 h-auto border-0 p-0 align-baseline opacity-100">
            <div
              className="m-0 border-0 p-0 align-baseline outline-offset-[-3px]"
              data-contextual-menu="true"
            >
              <div className="relative m-0 flex h-full w-full scroll-my-[100px] flex-col gap-1.5 rounded-sm border-0 p-4 align-baseline">
                <div className="relative m-0 flex shrink-0 flex-row items-center border-0 p-0 align-baseline">
                  <div className="m-0 flex min-w-0 max-w-full flex-row items-center border-0 p-0 align-baseline">
                    <div className="m-0 flex min-w-0 max-w-full shrink-0 flex-row items-center border-0 p-0 align-baseline">
                      <div className="m-0 inline-flex min-w-0 max-w-full flex-row border-0 p-0 align-baseline">
                        <div className="relative m-0 flex aspect-[1/1] h-[18px] w-[18px] shrink-0 cursor-default items-center justify-center border-0 p-0 align-baseline text-[lch(9.723_0_282.863)] leading-[0] no-underline transition-[color] duration-[0.15s] [-webkit-box-align:center] [-webkit-box-pack:center] dark:text-[lch(100_0_272)]">
                          <Avatar className="h-full w-full rounded-full">
                            <AvatarImage
                              src={comment.user.image || undefined}
                              alt={comment.user.name}
                            />
                            <AvatarFallback className="text-xs">
                              {comment.user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    </div>
                    <div className="m-0 flex min-w-0 max-w-full flex-col gap-[3px] border-0 p-0 align-baseline">
                      <div className="m-0 flex min-w-0 max-w-full flex-row items-center gap-2 border-0 p-0 align-baseline">
                        <span className="my-0 mr-0 ml-[9px] shrink-0 border-0 p-0 text-left align-baseline font-medium text-[13px] text-[lch(9.821_0_282.863)] dark:text-[lch(100_0_272)]">
                          <div className="m-0 inline-flex flex-row border-0 p-0 align-baseline">
                            <a
                              href={`/dashboard/team/${comment.user.id}`}
                              className="m-0 cursor-default overflow-hidden text-ellipsis whitespace-nowrap border-0 p-0 align-baseline text-[lch(9.723_0_282.863)] no-underline transition-[color] duration-[0.15s] dark:text-[lch(100_0_272)]"
                              tabIndex={-1}
                            >
                              <span className="m-0 overflow-hidden text-ellipsis whitespace-nowrap border-0 p-0 align-baseline">
                                {comment.user.name}
                              </span>
                            </a>
                          </div>
                        </span>
                        <TimeDisplay
                          timestamp={timestamp}
                          className="m-0 shrink-0 border-0 p-0 text-left align-baseline font-[450] text-[13px] text-[lch(39.286_1_282.863)] hover:text-[lch(19.643_1_282.863)] dark:text-[lch(63.975_1.933_272)] dark:hover:text-[lch(90.994_1.933_272)]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="m-0 shrink border-0 p-0 align-baseline text-[15px]">
                  <div className="m-0 border-0 p-0 align-baseline">
                    <div className="m-0 cursor-text select-text border-0 p-0 align-baseline font-[450] text-[15px] text-[lch(19.643_1_282.863)] leading-6 [font-feature-settings:'calt'] dark:text-[lch(90.994_1.933_272)]">
                      <div
                        className="prose prose-sm m-0 max-w-none whitespace-pre-wrap border-0 p-0 align-baseline"
                        // biome-ignore lint/security/noDangerouslySetInnerHtml: Comment content is sanitized by the backend
                        dangerouslySetInnerHTML={{ __html: comment.comment }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

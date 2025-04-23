<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VideoSummary extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'title',
        'video_url',
        'video_id',
        'summary',
        'key_points',
        'actionable_takeaways',
        'status',
        'saved_for_later',
    ];

    /**
     * Get the user that owns the video summary.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
